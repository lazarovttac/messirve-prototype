import { FirebaseClient } from "../config/firebase";
import {
  Customer,
  Reservation,
  Meal,
  Table,
  TableAssignment,
} from "../lib/types";

export class DatabaseService {
  private firebase: FirebaseClient;

  constructor(firebase: FirebaseClient) {
    this.firebase = firebase;
  }

  private validateAndConvertReservation(data: any): Reservation {
    // Ensure people is a number
    const people =
      typeof data.people === "string"
        ? parseInt(data.people, 10)
        : typeof data.people === "number"
        ? data.people
        : 0;

    // Ensure meals is an array
    const meals = Array.isArray(data.meals) ? data.meals : [];

    // Ensure time is a Date
    let time =
      data.time instanceof Date
        ? data.time
        : data.time?.toDate
        ? data.time.toDate()
        : new Date(data.time);
    if (isNaN(time.getTime())) {
      // If invalid, set to null or a default date (e.g., new Date(0))
      time = null;
    }

    // Trim customerName for extra safety
    const customerName = data.customerName
      ? String(data.customerName).trim()
      : "";

    return {
      id: data.id || "",
      customerId: data.customerId || "",
      customerName,
      table: data.table || "",
      time,
      people,
      meals,
      status: data.status || "pending",
    };
  }

  // Customer methods
  async getCustomerByPhone(phoneNumber: string): Promise<Customer | null> {
    try {
      const customersRef = this.firebase.db.collection("customers");
      const query = customersRef.where("phoneNumber", "==", phoneNumber.trim());
      const results = await query.get();
      if (results.empty) return null;
      const doc = results.docs[0];
      if (!doc) return null;
      return { id: doc.id, ...doc.data() } as Customer;
    } catch (error) {
      console.error(`Error al obtener cliente por teléfono:`, error);
      throw error;
    }
  }

  async getCustomerByName(name: string): Promise<Customer | null> {
    try {
      const customersRef = this.firebase.db.collection("customers");
      const query = customersRef.where("name", "==", name.trim());
      const results = await query.get();
      if (results.empty) return null;
      const doc = results.docs[0];
      if (!doc) return null;
      return { id: doc.id, ...doc.data() } as Customer;
    } catch (error) {
      console.error(`Error al obtener cliente por nombre:`, error);
      throw error;
    }
  }

  async createCustomer(customer: Omit<Customer, "id">): Promise<string> {
    try {
      const docRef = await this.firebase.db
        .collection("customers")
        .add(customer);
      return docRef.id;
    } catch (error) {
      console.error("Error al crear cliente:", error);
      throw error;
    }
  }

  // Reservation methods
  async getReservationById(reservationId: string): Promise<Reservation | null> {
    try {
      const doc = await this.firebase.db
        .collection("reservations")
        .doc(reservationId)
        .get();
      if (!doc || !doc.exists) return null;
      return this.validateAndConvertReservation({ id: doc.id, ...doc.data() });
    } catch (error) {
      console.error(`Error al obtener reserva por id:`, error);
      throw error;
    }
  }

  async getReservationsByCustomer(customerId: string): Promise<Reservation[]> {
    try {
      console.log("Getting reservations by customer:", customerId);
      const reservationsRef = this.firebase.db.collection("reservations");
      const query = reservationsRef.where("customerId", "==", customerId);
      const snapshot = await query.get();

      return snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          customerId: data.customerId,
          customerName: data.customerName,
          table: data.table,
          time: data.time.toDate(), // Convert Firestore Timestamp to Date
          people: data.people,
          meals:
            data.meals?.map((meal: any) => ({
              name: meal.name,
              prepTime: meal.prepTime,
              status: meal.status,
            })) || [],
          status: data.status,
        };
      });
    } catch (error) {
      console.error("Error getting reservations:", error);
      throw new Error("Error al obtener las reservas");
    }
  }

  async getAllReservations(): Promise<Reservation[]> {
    try {
      const snapshot = await this.firebase.db.collection("reservations").get();

      return snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          customerId: data.customerId,
          customerName: data.customerName,
          table: data.table,
          time: data.time.toDate(), // Convert Firestore Timestamp to Date
          people: data.people,
          meals:
            data.meals?.map((meal: any) => ({
              name: meal.name,
              prepTime: meal.prepTime,
              status: meal.status,
            })) || [],
          status: data.status,
        };
      });
    } catch (error) {
      console.error("Error getting all reservations:", error);
      throw new Error("Error al obtener todas las reservas");
    }
  }

  async createReservation(data: Partial<Reservation>): Promise<string> {
    try {
      const validatedReservation: Reservation = {
        id: this.firebase.db.collection("reservations").doc().id,
        customerId: data.customerId || "",
        customerName: data.customerName || "",
        table: data.table || "",
        time: data.time || new Date(),
        people: data.people || 0,
        meals:
          data.meals?.map((meal) => ({
            name: meal.name,
            prepTime: meal.prepTime,
            status: meal.status || "pending",
          })) || [],
        status: data.status || "pending",
      };

      await this.firebase.db
        .collection("reservations")
        .doc(validatedReservation.id)
        .set(validatedReservation);

      return validatedReservation.id;
    } catch (error) {
      console.error("Error creating reservation:", error);
      throw new Error("Error al crear la reserva");
    }
  }

  async updateReservation(
    reservationId: string,
    updateData: Partial<Reservation>
  ): Promise<void> {
    try {
      const validatedUpdateData: Partial<Reservation> = {
        ...(updateData.customerId && { customerId: updateData.customerId }),
        ...(updateData.customerName && {
          customerName: updateData.customerName,
        }),
        ...(updateData.table && { table: updateData.table }),
        ...(updateData.time && { time: updateData.time }),
        ...(updateData.people && { people: updateData.people }),
        ...(updateData.status && { status: updateData.status }),
        ...(updateData.meals && {
          meals: updateData.meals.map((meal) => ({
            name: meal.name,
            prepTime: meal.prepTime,
            status: meal.status || "pending",
          })),
        }),
      };

      await this.firebase.db
        .collection("reservations")
        .doc(reservationId)
        .update(validatedUpdateData);
    } catch (error) {
      console.error("Error updating reservation:", error);
      throw new Error("Error al actualizar la reserva");
    }
  }

  async getAllTables(): Promise<Table[]> {
    //agregado
    try {
      const snapshot = await this.firebase.db
        .collection("tables")
        .orderBy("people", "asc")
        .get();

      return snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          people: data.people,
        };
      });
    } catch (error) {
      console.error("Error getting tables:", error);
      throw new Error("Error al obtener las mesas");
    }
  }

  async assignTable(
    time: Date,
    amountOfPeople: number
  ): Promise<TableAssignment> {
    //modificado
    try {
      const allRestaurantTables = await this.getAllTables();
      const allReservations = await this.getAllReservations();
      const reservedTables = allReservations
        .filter((r) => new Date(r.time).getTime() === time.getTime())
        .map((r) => r.table);
      for (let table of allRestaurantTables) {
        if (
          !reservedTables.includes(table.id) &&
          amountOfPeople <= table.people
        ) {
          const tableAssignment = {
            id: table.id,
            message: "",
          };
          return tableAssignment;
        }
      }
      const tableAssignment = {
        id: "-1",
        message: "no se pudo asignar la mesa",
      };
      return tableAssignment;
    } catch (error) {
      throw new Error(
        "Perdón pero no tenemos mesas disponibles en ese horario"
      );
    }
  }

  async getOverlappingReservations(
    startTime: Date,
    endTime: Date,
    customerId: string
  ): Promise<Reservation[]> {
    try {
      const reservationsRef = this.firebase.db.collection("reservations");
      const query = reservationsRef
        .where("customerId", "==", customerId)
        .where("status", "!=", "cancelled");
      const results = await query.get();

      return results.docs
        .map((doc) => ({ id: doc.id, ...doc.data() } as Reservation))
        .filter((reservation) => {
          const reservationTime = new Date(reservation.time);
          const reservationEndTime = new Date(
            reservationTime.getTime() + 3 * 60 * 60 * 1000
          ); // 3 hours

          // Check if the new reservation overlaps with existing one
          return (
            (startTime >= reservationTime && startTime < reservationEndTime) || // New start time falls within existing reservation
            (endTime > reservationTime && endTime <= reservationEndTime) || // New end time falls within existing reservation
            (startTime <= reservationTime && endTime >= reservationEndTime) // New reservation completely encompasses existing reservation
          );
        });
    } catch (error) {
      console.error("Error al obtener reservas superpuestas:", error);
      throw error;
    }
  }

  async getReservationsByTimeRange(
    startTime: Date,
    endTime: Date
  ): Promise<Reservation[]> {
    try {
      const reservationsRef = this.firebase.db.collection("reservations");
      const query = reservationsRef
        .where("time", ">=", startTime)
        .where("time", "<=", endTime);
      const snapshot = await query.get();

      return snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          customerId: data.customerId,
          customerName: data.customerName,
          table: data.table,
          time: data.time.toDate(),
          people: data.people,
          meals:
            data.meals?.map((meal: any) => ({
              name: meal.name,
              prepTime: meal.prepTime,
              status: meal.status,
            })) || [],
          status: data.status,
        };
      });
    } catch (error) {
      console.error("Error getting reservations by time range:", error);
      throw new Error("Error al obtener las reservas por rango de tiempo");
    }
  }

  async deleteReservation(reservationId: string): Promise<void> {
    try {
      await this.firebase.db
        .collection("reservations")
        .doc(reservationId)
        .delete();
    } catch (error) {
      console.error("Error deleting reservation:", error);
      throw new Error("Error al eliminar la reserva");
    }
  }
}
