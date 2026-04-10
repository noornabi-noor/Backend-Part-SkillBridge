export interface IAvailabilityCreate {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export interface IAvailabilityUpdate {
  dayOfWeek?: number;
  startTime?: string;
  endTime?: string;
  isBooked?: boolean;
}
