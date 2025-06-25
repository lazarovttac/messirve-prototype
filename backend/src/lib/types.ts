export type MealStatus =
  | "completed"
  | "in-progress"
  | "urgent"
  | "upcoming"
  | "pending";

export interface Meal {
  name: string;
  prepTime: number;
  status: MealStatus;
}

export interface Reservation {
  id: string;
  customerId: string;
  customerName: string;
  table: string;
  time: Date;
  people: number;
  meals: Meal[];
  status: string;
}

export interface Customer {
  id: string;
  name: string;
  phoneNumber: string;
}

export interface Table {  //agregado por chuli
  id: string;
  chairs: number; 
}
export interface TableAssignment {
  id: string;
  message: string;
}
