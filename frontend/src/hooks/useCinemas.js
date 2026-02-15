import { useCallback, useEffect, useState } from 'react';
import { useData } from '../context/DataContext';
import api from '../services/api';

export function useCinemas() {
  const { cinemas, setCinemas } = useData();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api
      .get('/cinemas')
      .then((res) => {
        if (!cancelled) setCinemas(res.data);
      })
      .catch((err) => {
        if (!cancelled) setError('Error al cargar las salas.');
        console.error(err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [setCinemas]);

  const addCinema = useCallback(
    async (cinemaData) => {
      const payload = {
        ...cinemaData,
        total_seats: parseInt(cinemaData.rows_count, 10) * parseInt(cinemaData.seats_per_row, 10),
        rows_count: parseInt(cinemaData.rows_count, 10),
        seats_per_row: parseInt(cinemaData.seats_per_row, 10),
        active: true,
      };
      const res = await api.post('/cinemas', payload);
      setCinemas((prev) => [...prev, res.data]);
    },
    [setCinemas]
  );

  const updateCinema = useCallback(
    async (id, cinemaData) => {
      const payload = {
        ...cinemaData,
        id,
        total_seats: parseInt(cinemaData.rows_count, 10) * parseInt(cinemaData.seats_per_row, 10),
        rows_count: parseInt(cinemaData.rows_count, 10),
        seats_per_row: parseInt(cinemaData.seats_per_row, 10),
        active: true,
      };
      const res = await api.put(`/cinemas/${id}`, payload);
      setCinemas((prev) => prev.map((c) => (c.id === id ? res.data : c)));
    },
    [setCinemas]
  );

  const deleteCinema = useCallback(
    async (id) => {
      await api.delete(`/cinemas/${id}`);
      setCinemas((prev) => prev.filter((c) => c.id !== id));
    },
    [setCinemas]
  );

  return { cinemas, addCinema, updateCinema, deleteCinema, loading, error };
}
