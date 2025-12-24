import { useState } from 'react';
import type { AppSettings } from '../types';

interface SettingsProps {
  settings: AppSettings;
  onSave: (settings: AppSettings) => void;
  onClose: () => void;
}

export function Settings({ settings, onSave, onClose }: SettingsProps) {
  const [numberOfRooms, setNumberOfRooms] = useState(settings.numberOfRooms);
  const [startTime, setStartTime] = useState(settings.startTime);
  const [endTime, setEndTime] = useState(settings.endTime);

  const handleSave = () => {
    onSave({
      numberOfRooms,
      startTime,
      endTime,
    });
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>設定</h2>
        <div className="settings-form">
          <div className="form-group">
            <label htmlFor="numberOfRooms">部屋数:</label>
            <input
              id="numberOfRooms"
              type="number"
              min="1"
              max="20"
              value={numberOfRooms}
              onChange={(e) => setNumberOfRooms(parseInt(e.target.value) || 1)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="startTime">始業時間:</label>
            <input
              id="startTime"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="endTime">終業時間:</label>
            <input
              id="endTime"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>
        </div>
        <div className="modal-buttons">
          <button onClick={handleSave} className="btn-primary">保存</button>
          <button onClick={onClose} className="btn-secondary">キャンセル</button>
        </div>
      </div>
    </div>
  );
}
