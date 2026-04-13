export interface ICategoryCreate {
  name: string;
  icon?: string;
}

export interface ICategoryUpdate {
  name?: string;
  tutorIds?: string[];
  icon?: string;
}
