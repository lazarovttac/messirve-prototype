export type MealStatus =
  | "completed"
  | "in-progress"
  | "urgent"
  | "upcoming"
  | "pending";

export type ReservationStatus =
  | "confirmed"
  | "cancelled"
  | "pending"
  | "completed";

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
  tableName?: string;
  time: Date;
  people: number;
  meals: Meal[];
  status: ReservationStatus;
}

export interface Customer {
  id: string;
  name: string;
  phoneNumber: string;
}

export interface Table {
  id: string;
  name: string;
  people: number;
}

export interface TableAssignment {
  id: string;
  message: string;
}
