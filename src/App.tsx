import { useState } from 'react';
import { Settings } from './components/Settings';
import { ReservationGrid } from './components/ReservationGrid';
import type { AppSettings, Reservation } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import './App.css';

const defaultSettings: AppSettings = {
  numberOfRooms: 5,
  startTime: '09:00',
  endTime: '18:00',
};

function App() {
  const [settings, setSettings] = useLocalStorage<AppSettings>(
    'roomReservationSettings',
    defaultSettings
  );
  const [reservations, setReservations] = useLocalStorage<Reservation[]>(
    'roomReservations',
    []
  );
  const [showSettings, setShowSettings] = useState(false);

  const handleAddReservation = (reservation: Omit<Reservation, 'id'>) => {
    const newReservation: Reservation = {
      ...reservation,
      id: `${Date.now()}-${Math.random()}`,
    };
    setReservations([...reservations, newReservation]);
  };

  const handleDeleteReservation = (id: string) => {
    setReservations(reservations.filter((res) => res.id !== id));
  };

  const handleSaveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>部屋予約管理システム</h1>
        <button onClick={() => setShowSettings(true)} className="btn-settings">
          ⚙️ 設定
        </button>
      </header>

      <main className="app-main">
        <ReservationGrid
          settings={settings}
          reservations={reservations}
          onAddReservation={handleAddReservation}
          onDeleteReservation={handleDeleteReservation}
        />
      </main>

      {showSettings && (
        <Settings
          settings={settings}
          onSave={handleSaveSettings}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}

export default App;
