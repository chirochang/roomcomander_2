import { useState, useMemo } from 'react';
import type { AppSettings, Reservation, TimeSlot } from '../types';

interface ReservationGridProps {
  settings: AppSettings;
  reservations: Reservation[];
  onAddReservation: (reservation: Omit<Reservation, 'id'>) => void;
  onDeleteReservation: (id: string) => void;
}

export function ReservationGrid({
  settings,
  reservations,
  onAddReservation,
  onDeleteReservation,
}: ReservationGridProps) {
  const [selectedCell, setSelectedCell] = useState<{
    roomId: number;
    time: string;
  } | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newReservation, setNewReservation] = useState({
    title: '',
    startTime: '',
    endTime: '',
    description: '',
  });

  // Generate time slots (5-minute intervals)
  const timeSlots = useMemo(() => {
    const slots: TimeSlot[] = [];
    const [startHour, startMinute] = settings.startTime.split(':').map(Number);
    const [endHour, endMinute] = settings.endTime.split(':').map(Number);

    let currentHour = startHour;
    let currentMinute = startMinute;

    while (
      currentHour < endHour ||
      (currentHour === endHour && currentMinute <= endMinute)
    ) {
      slots.push({
        hour: currentHour,
        minute: currentMinute,
        label: `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`,
      });

      currentMinute += 5;
      if (currentMinute >= 60) {
        currentMinute = 0;
        currentHour += 1;
      }
    }

    return slots;
  }, [settings.startTime, settings.endTime]);

  // Generate room numbers
  const rooms = useMemo(() => {
    return Array.from({ length: settings.numberOfRooms }, (_, i) => i + 1);
  }, [settings.numberOfRooms]);

  // Check if a cell has a reservation
  const getReservationForCell = (roomId: number, timeLabel: string) => {
    return reservations.find(
      (res) =>
        res.roomId === roomId &&
        res.startTime <= timeLabel &&
        res.endTime > timeLabel
    );
  };

  // Calculate reservation span
  const getReservationSpan = (reservation: Reservation) => {
    const startIdx = timeSlots.findIndex((slot) => slot.label === reservation.startTime);
    const endIdx = timeSlots.findIndex((slot) => slot.label === reservation.endTime);
    return endIdx - startIdx;
  };

  const handleCellClick = (roomId: number, time: string) => {
    const existingReservation = getReservationForCell(roomId, time);
    if (existingReservation) {
      if (window.confirm(`「${existingReservation.title}」を削除しますか?`)) {
        onDeleteReservation(existingReservation.id);
      }
    } else {
      setSelectedCell({ roomId, time });
      setNewReservation({
        title: '',
        startTime: time,
        endTime: time,
        description: '',
      });
      setIsCreating(true);
    }
  };

  const handleCreateReservation = () => {
    if (!selectedCell || !newReservation.title.trim()) {
      alert('タイトルを入力してください');
      return;
    }

    if (newReservation.startTime >= newReservation.endTime) {
      alert('終了時刻は開始時刻より後にしてください');
      return;
    }

    onAddReservation({
      roomId: selectedCell.roomId,
      title: newReservation.title,
      startTime: newReservation.startTime,
      endTime: newReservation.endTime,
      description: newReservation.description,
    });

    setIsCreating(false);
    setSelectedCell(null);
    setNewReservation({ title: '', startTime: '', endTime: '', description: '' });
  };

  const handleCancelCreate = () => {
    setIsCreating(false);
    setSelectedCell(null);
    setNewReservation({ title: '', startTime: '', endTime: '', description: '' });
  };

  return (
    <>
      <div className="grid-container">
        <div className="grid-wrapper">
          {/* Header row with time labels */}
          <div className="grid-header">
            <div className="room-header">部屋</div>
            {timeSlots.map((slot) => (
              <div key={slot.label} className="time-header">
                {slot.label}
              </div>
            ))}
          </div>

          {/* Grid rows for each room */}
          {rooms.map((roomId) => (
            <div key={roomId} className="grid-row">
              <div className="room-label">部屋 {roomId}</div>
              {timeSlots.map((slot) => {
                const reservation = getReservationForCell(roomId, slot.label);
                const isReservationStart =
                  reservation && reservation.startTime === slot.label;
                const hasReservation = reservation !== undefined;

                if (hasReservation && !isReservationStart) {
                  return null;
                }

                const span = isReservationStart ? getReservationSpan(reservation) : 1;

                return (
                  <div
                    key={slot.label}
                    className={`grid-cell ${hasReservation ? 'reserved' : ''}`}
                    style={{
                      gridColumn: hasReservation ? `span ${span}` : undefined,
                    }}
                    onClick={() => handleCellClick(roomId, slot.label)}
                  >
                    {hasReservation && reservation && (
                      <div className="reservation-content">
                        <div className="reservation-title">{reservation.title}</div>
                        {reservation.description && (
                          <div className="reservation-desc">{reservation.description}</div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Reservation creation modal */}
      {isCreating && selectedCell && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>予約作成</h2>
            <div className="reservation-form">
              <div className="form-group">
                <label>部屋: 部屋 {selectedCell.roomId}</label>
              </div>
              <div className="form-group">
                <label htmlFor="title">タイトル:</label>
                <input
                  id="title"
                  type="text"
                  value={newReservation.title}
                  onChange={(e) =>
                    setNewReservation({ ...newReservation, title: e.target.value })
                  }
                  placeholder="会議名など"
                />
              </div>
              <div className="form-group">
                <label htmlFor="startTime">開始時刻:</label>
                <select
                  id="startTime"
                  value={newReservation.startTime}
                  onChange={(e) =>
                    setNewReservation({ ...newReservation, startTime: e.target.value })
                  }
                >
                  {timeSlots.map((slot) => (
                    <option key={slot.label} value={slot.label}>
                      {slot.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="endTime">終了時刻:</label>
                <select
                  id="endTime"
                  value={newReservation.endTime}
                  onChange={(e) =>
                    setNewReservation({ ...newReservation, endTime: e.target.value })
                  }
                >
                  {timeSlots.map((slot) => (
                    <option key={slot.label} value={slot.label}>
                      {slot.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="description">説明 (任意):</label>
                <textarea
                  id="description"
                  value={newReservation.description}
                  onChange={(e) =>
                    setNewReservation({ ...newReservation, description: e.target.value })
                  }
                  placeholder="詳細な説明"
                  rows={3}
                />
              </div>
            </div>
            <div className="modal-buttons">
              <button onClick={handleCreateReservation} className="btn-primary">
                作成
              </button>
              <button onClick={handleCancelCreate} className="btn-secondary">
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
