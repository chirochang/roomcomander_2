export interface AppSettings {
  numberOfRooms: number;
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
}

export interface Reservation {
  id: string;
  roomId: number;
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  title: string;
  description?: string;
}

export interface TimeSlot {
  hour: number;
  minute: number;
  label: string;
}
