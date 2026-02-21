import { useCallback, useEffect, useState } from 'react';
import { useData } from '../context/DataContext';
import { calculateEndTime } from '../lib/formatters';
import api from '../services/api';

function checkOverlap(cinemaId, date, startTime, endTime, sessions, movies) {
  const sameCinemaSameDay = sessions.filter((s) => {
    const sDate = s.session_datetime.split('T')[0];
    return s.cinema_id === cinemaId && sDate === date;
  });

  for (const s of sameCinemaSameDay) {
    const movie = movies.find((m) => m.id === s.movie_id);
    if (!movie) continue;
    const sStart = s.session_datetime.split('T')[1].slice(0, 5);
    const sEnd = calculateEndTime(date, sStart, movie.duration_minutes);

    if (startTime < sEnd && endTime > sStart) {
      return {
        movieTitle: movie.title,
        startTime: sStart,
        endTime: sEnd,
      };
    }
  }
  return null;
}

export function useSessions() {
  const { sessions, setSessions, movies, cinemas } = useData();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api
      .get('/sessions')
      .then((res) => {
        if (!cancelled) setSessions(res.data);
      })
      .catch((err) => {
        if (!cancelled) setError('Error al cargar las sesiones.');
        console.error(err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [setSessions]);

  const addSession = useCallback(
    async (formData) => {
      const movie = movies.find((m) => m.id === parseInt(formData.movie_id, 10));
      const cinema = cinemas.find((c) => c.id === parseInt(formData.cinema_id, 10));

      if (!movie || !cinema) {
        return { success: false, error: 'Película o sala no encontrada.' };
      }

      const endTime = calculateEndTime(formData.date, formData.start_time, movie.duration_minutes);

      const overlap = checkOverlap(
        parseInt(formData.cinema_id, 10),
        formData.date,
        formData.start_time,
        endTime,
        sessions,
        movies
      );

      if (overlap) {
        return {
          success: false,
          error: `Conflicto con "${overlap.movieTitle}" (${overlap.startTime} - ${overlap.endTime}).`,
        };
      }

      try {
        const payload = {
          movie: { id: parseInt(formData.movie_id, 10) },
          cinema: { id: parseInt(formData.cinema_id, 10) },
          session_datetime: `${formData.date}T${formData.start_time}:00`,
          price_normal: parseFloat(formData.price_normal),
          price_vip: parseFloat(formData.price_vip),
          available_seats: cinema.total_seats,
          active: true,
        };
        const res = await api.post('/sessions', payload);
        setSessions((prev) => [...prev, res.data]);
        return { success: true };
      } catch (err) {
        console.error(err);
        return { success: false, error: 'Error al crear la sesión en el servidor.' };
      }
    },
    [sessions, setSessions, movies, cinemas]
  );

  const deleteSession = useCallback(
    async (id) => {
      await api.delete(`/sessions/${id}`);
      setSessions((prev) => prev.filter((s) => s.id !== id));
    },
    [setSessions]
  );

  return { sessions, addSession, deleteSession, movies, cinemas, loading, error };
}
