import { useCallback, useEffect, useState } from 'react';
import { useData } from '../context/DataContext';
import api from '../services/api';

export function useMovies() {
  const { movies, setMovies } = useData();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api
      .get('/movies')
      .then((res) => {
        if (!cancelled) setMovies(res.data);
      })
      .catch((err) => {
        if (!cancelled) setError('Error al cargar las películas.');
        console.error(err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [setMovies]);

  const addMovie = useCallback(
    async (movieData) => {
      const payload = {
        ...movieData,
        duration_minutes: parseInt(movieData.duration_minutes, 10),
        rating: parseFloat(movieData.rating) || 0,
        active: true,
      };
      const res = await api.post('/movies', payload);
      setMovies((prev) => [...prev, res.data]);
    },
    [setMovies]
  );

  const updateMovie = useCallback(
    async (id, movieData) => {
      const payload = {
        ...movieData,
        id,
        duration_minutes: parseInt(movieData.duration_minutes, 10),
        rating: parseFloat(movieData.rating) || 0,
        active: true,
      };
      const res = await api.put(`/movies/${id}`, payload);
      setMovies((prev) => prev.map((m) => (m.id === id ? res.data : m)));
    },
    [setMovies]
  );

  const deleteMovie = useCallback(
    async (id) => {
      await api.delete(`/movies/${id}`);
      setMovies((prev) => prev.filter((m) => m.id !== id));
    },
    [setMovies]
  );

  return { movies, addMovie, updateMovie, deleteMovie, loading, error };
}
