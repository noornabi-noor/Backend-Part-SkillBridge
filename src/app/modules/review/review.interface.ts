export interface IReviewCreate {
  rating: number;
  comment?: string;
  studentId: string;
  tutorId: string;
  bookingId: string;
}

export interface IReviewUpdate {
  rating?: number;
  comment?: string;
}
