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

export interface MenuItem {
  name: string;
  description: string;
  price: number;
  category: string;
}

export interface RestaurantConfig {
  name: string;
  address: string;
  googleMaps: string;
  description: string;
  menuOnline: string;
  socialMedia: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
  };
  menu: MenuItem[];
}
