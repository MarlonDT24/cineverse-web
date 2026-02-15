import { createContext, useContext, useState } from 'react';

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const [movies, setMovies] = useState([]);
  const [cinemas, setCinemas] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [conversations, setConversations] = useState([]);

  return (
    <DataContext.Provider
      value={{
        movies,
        setMovies,
        cinemas,
        setCinemas,
        sessions,
        setSessions,
        conversations,
        setConversations,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
