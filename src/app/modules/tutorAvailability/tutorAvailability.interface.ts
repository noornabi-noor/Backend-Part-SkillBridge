export interface ICreateTutorAvailabilityPayload {
    availabilityIds: string[];
}

export interface IUpdateTutorAvailabilityPayload {
    availabilities: {
        shouldDelete: boolean;
        id: string; // availabilityId
    }[]
}