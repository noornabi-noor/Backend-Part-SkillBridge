export interface ICategoryCreate {
  name: string;
}

export interface ICategoryUpdate {
  name?: string;
  tutorIds?: string[];
}
