import { FirebaseClient } from "../config/firebase";
import { Customer, Reservation, Meal, Table, TableAssignment } from "../lib/types";

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
      const reservationsRef = this.firebase.db.collection("reservations");
      const query = reservationsRef.where("customerId", "==", customerId);
      const results = await query.get();
      return results.docs.map((doc: any) =>
        this.validateAndConvertReservation({ id: doc.id, ...doc.data() })
      );
    } catch (error) {
      console.error(`Error al obtener reservas por cliente:`, error);
      throw error;
    }
  }

  async getAllReservations(): Promise<Reservation[]> {
    try {
      const snapshot = await this.firebase.db.collection("reservations").get();
      return snapshot.docs.map((doc: any) =>
        this.validateAndConvertReservation({ id: doc.id, ...doc.data() })
      );
    } catch (error) {
      console.error("Error al obtener todas las reservas:", error);
      throw error;
    }
  }

  async createReservation(
    reservation: Omit<Reservation, "id">
  ): Promise<string> {
    try {
      // Validate the reservation data before saving
      const validatedReservation =
        this.validateAndConvertReservation(reservation);
      // Convert to plain object for Firebase
      const firebaseData = {
        customerId: validatedReservation.customerId,
        customerName: validatedReservation.customerName,
        table: validatedReservation.table,
        time: validatedReservation.time,
        people: validatedReservation.people,
        meals: validatedReservation.meals,
        status: validatedReservation.status,
      };
      const docRef = await this.firebase.db
        .collection("reservations")
        .add(firebaseData);
      return docRef.id;
    } catch (error) {
      console.error("Error al crear reserva:", error);
      throw error;
    }
  }

  async updateReservation(
    reservationId: string,
    updateData: Partial<Reservation>
  ): Promise<void> {
    try {
      // Validate the update data before saving
      const validatedUpdateData =
        this.validateAndConvertReservation(updateData);
      // Convert to plain object for Firebase
      const firebaseData = {
        customerId: validatedUpdateData.customerId,
        customerName: validatedUpdateData.customerName,
        table: validatedUpdateData.table,
        time: validatedUpdateData.time,
        people: validatedUpdateData.people,
        meals: validatedUpdateData.meals,
        status: validatedUpdateData.status,
      };
      await this.firebase.db
        .collection("reservations")
        .doc(reservationId)
        .update(firebaseData);
    } catch (error) {
      console.error(`Error al actualizar reserva:`, error);
      throw error;
    }
  }

  async getAllTables(): Promise<Table[]> { //agregado
    try {
      const snapshot = await this.firebase.db
        .collection("tables")
        .orderBy("chairs", "asc") 
        .get();

      return snapshot.docs.map(
        (doc: any) => ({ id: doc.id, ...doc.data() } as Table) //el ...doc.data elimina los corchetes del objeto. 
      );
    } catch (error) {
      console.error("Error al obtener todas las mesas:", error);
      throw error;
    }
  }

  async assignTable(time: Date, amountOfPeople: number ): Promise<TableAssignment> { //modificado
    try {

      const allRestaurantTables = await this.getAllTables();
      const allReservations = await this.getAllReservations();
      const reservedTables = allReservations
      .filter((r) => new Date(r.time).getTime() === time.getTime())
      .map((r) => r.table);
      for (let table of allRestaurantTables) {
        if (!reservedTables.includes(table.id) && (amountOfPeople <= table.chairs)){
          const tableAssignment = {
            "id": table.id, 
            "message": ""
          }
          return tableAssignment;
        }
      }
      const tableAssignment = {
        "id": "-1", 
        "message": "no se pudo asignar la mesa"
      }
      return tableAssignment;
    }
    catch(error) {
      throw new Error('Perdón pero no tenemos mesas disponibles en ese horario');
    }
    

      /*
  async assignTable(time: Date, amountOfPeople: number ): Promise<string> { //modificado
    const allRestaurantTables = await this.getAllTables();
    const allReservations = await this.getAllReservations();
    const reservedTables = allReservations
      .filter((r) => new Date(r.time).getTime() === time.getTime())
      .map((r) => r.table);
    for (let table of allRestaurantTables) {
      if (!reservedTables.includes(table.id) && (amountOfPeople <= table.chairs)){
        return table.toString();
      }
    }





    const allRestaurantTables = await this.getAllTables();
    const allReservations = await this.getAllReservations();
    const reservedTables = allReservations
      .filter((r) => new Date(r.time).getTime() === time.getTime())
      .map((r) => r.table);

    for (let i = 1; i <= maxTables; i++) {
      if (!reservedTables.includes(i.toString())) {
        return i.toString();
      }
    }*/
    
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
}
