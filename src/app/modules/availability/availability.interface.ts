export interface ICreateAvailabilityPayload {
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
}

export interface IUpdateAvailabilityPayload {
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
}

export interface ITutorAvailabilityPayload {
  tutorId: string;
  availabilityIds: string[];
}