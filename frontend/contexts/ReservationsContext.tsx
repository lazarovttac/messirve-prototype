"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { db } from "@/lib/firebase";
import { Reservation, Meal, Table } from "@/lib/types";
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  Timestamp,
  serverTimestamp,
  onSnapshot,
} from "firebase/firestore";

interface ReservationsContextType {
  reservations: Reservation[];
  loading: boolean;
  error: string | null;
  getReservation: (id: string) => Promise<Reservation | null>;
  getReservationsByDate: (date: Date) => Promise<Reservation[]>;
  getReservationsByTable: (tableId: string) => Promise<Reservation[]>;
  createReservation: (
    reservationData: Omit<Reservation, "id">
  ) => Promise<string>;
  updateReservation: (
    id: string,
    reservationData: Partial<Omit<Reservation, "id">>
  ) => Promise<void>;
  deleteReservation: (id: string) => Promise<void>;
  refreshReservations: () => Promise<void>;
  generateTestReservations: (count: number) => Promise<void>;
}

const ReservationsContext = createContext<ReservationsContextType | undefined>(
  undefined
);

export const useReservations = () => {
  const context = useContext(ReservationsContext);
  if (!context) {
    throw new Error(
      "useReservations debe usarse dentro de un ReservationsProvider"
    );
  }
  return context;
};

export function ReservationsProvider({ children }: { children: ReactNode }) {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Function to convert Firestore timestamp to Date
  const convertTimestampToDate = (data: any): Reservation => {
    if (data.time instanceof Timestamp) {
      return { ...data, time: data.time.toDate() };
    }
    return data;
  };

  // Fetch tables and listen for changes
  useEffect(() => {
    const tablesUnsubscribe = onSnapshot(
      collection(db, "tables"),
      (snapshot) => {
        const tablesData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Table[];
        setTables(tablesData);
      }
    );

    return () => tablesUnsubscribe();
  }, []);

  // Function to fetch reservations with table names
  const fetchReservations = async () => {
    try {
      setLoading(true);
      setError(null);

      const reservationsCollection = collection(db, "reservations");
      const reservationsQuery = query(reservationsCollection, orderBy("time"));
      const querySnapshot = await getDocs(reservationsQuery);

      const reservationsData: Reservation[] = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        // Convert Firestore timestamp to Date
        const time =
          data.time instanceof Timestamp
            ? data.time.toDate()
            : new Date(data.time);

        // Find the table name if available
        const tableId = data.table;
        const tableInfo = tables.find((t) => t.id === tableId);

        return {
          id: doc.id,
          ...data,
          time,
          meals: Array.isArray(data.meals) ? data.meals : [],
          tableName: tableInfo?.name || "Mesa " + tableId.substring(0, 5),
        } as Reservation;
      });

      setReservations(reservationsData);
    } catch (err) {
      console.error("Error fetching reservations:", err);
      setError("Error al cargar las reservas. Por favor intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch and setup listener for reservations
  useEffect(() => {
    fetchReservations();

    // Set up listener for real-time updates
    const unsubscribe = onSnapshot(
      query(collection(db, "reservations"), orderBy("time")),
      (snapshot) => {
        const reservationsData = snapshot.docs.map((doc) => {
          const data = doc.data();
          // Convert Firestore timestamp to Date
          const time =
            data.time instanceof Timestamp
              ? data.time.toDate()
              : new Date(data.time);

          // Find the table name if available
          const tableId = data.table;
          const tableInfo = tables.find((t) => t.id === tableId);

          return {
            id: doc.id,
            ...data,
            time,
            meals: Array.isArray(data.meals) ? data.meals : [],
            tableName: tableInfo?.name || "Mesa " + tableId.substring(0, 5),
          } as Reservation;
        });

        setReservations(reservationsData);
        setLoading(false);
      },
      (error) => {
        console.error("Error listening to reservations:", error);
        setError("Error al escuchar cambios en las reservas.");
      }
    );

    return () => unsubscribe();
  }, [tables]);

  const getReservation = async (id: string): Promise<Reservation | null> => {
    try {
      const reservationRef = doc(db, "reservations", id);
      const reservationDoc = await getDoc(reservationRef);

      if (reservationDoc.exists()) {
        const data = reservationDoc.data();
        return convertTimestampToDate({
          id: reservationDoc.id,
          ...data,
          meals: Array.isArray(data.meals) ? data.meals : [],
        });
      }

      return null;
    } catch (err) {
      console.error(`Error getting reservation ${id}:`, err);
      setError(`Error al obtener la reserva. Por favor intenta nuevamente.`);
      return null;
    }
  };

  const getReservationsByDate = async (date: Date): Promise<Reservation[]> => {
    try {
      // Create start and end date for the day
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const reservationsCollection = collection(db, "reservations");
      const reservationsQuery = query(
        reservationsCollection,
        where("time", ">=", startOfDay),
        where("time", "<=", endOfDay),
        orderBy("time")
      );

      const querySnapshot = await getDocs(reservationsQuery);

      return querySnapshot.docs.map((doc) => {
        const data = doc.data();

        // Find the table name if available
        const tableId = data.table;
        const tableInfo = tables.find((t) => t.id === tableId);

        return convertTimestampToDate({
          id: doc.id,
          ...data,
          meals: Array.isArray(data.meals) ? data.meals : [],
          tableName: tableInfo?.name || "Mesa " + tableId.substring(0, 5),
        });
      });
    } catch (err) {
      console.error("Error fetching reservations by date:", err);
      setError(
        "Error al cargar las reservas por fecha. Por favor intenta nuevamente."
      );
      return [];
    }
  };

  const getReservationsByTable = async (
    tableId: string
  ): Promise<Reservation[]> => {
    try {
      const reservationsCollection = collection(db, "reservations");
      const reservationsQuery = query(
        reservationsCollection,
        where("table", "==", tableId),
        orderBy("time")
      );

      const querySnapshot = await getDocs(reservationsQuery);

      return querySnapshot.docs.map((doc) => {
        const data = doc.data();

        // Find the table name if available
        const currentTableId = data.table;
        const tableInfo = tables.find((t) => t.id === currentTableId);

        return convertTimestampToDate({
          id: doc.id,
          ...data,
          meals: Array.isArray(data.meals) ? data.meals : [],
          tableName:
            tableInfo?.name || "Mesa " + currentTableId.substring(0, 5),
        });
      });
    } catch (err) {
      console.error(`Error fetching reservations for table ${tableId}:`, err);
      setError(
        "Error al cargar las reservas de la mesa. Por favor intenta nuevamente."
      );
      return [];
    }
  };

  const createReservation = async (
    reservationData: Omit<Reservation, "id">
  ): Promise<string> => {
    try {
      // Convert JavaScript Date to Firestore timestamp
      const firestoreData = {
        ...reservationData,
        time: reservationData.time,
      };

      const reservationsCollection = collection(db, "reservations");
      const docRef = await addDoc(reservationsCollection, firestoreData);

      // Refresh reservations list
      await fetchReservations();

      return docRef.id;
    } catch (err) {
      console.error("Error creating reservation:", err);
      setError("Error al crear la reserva. Por favor intenta nuevamente.");
      throw err;
    }
  };

  const updateReservation = async (
    id: string,
    reservationData: Partial<Omit<Reservation, "id">>
  ): Promise<void> => {
    try {
      // Handle date conversion if time is included in the update
      const firestoreData = { ...reservationData };

      const reservationRef = doc(db, "reservations", id);
      await updateDoc(reservationRef, firestoreData);

      // Refresh reservations list
      await fetchReservations();
    } catch (err) {
      console.error(`Error updating reservation ${id}:`, err);
      setError("Error al actualizar la reserva. Por favor intenta nuevamente.");
      throw err;
    }
  };

  const deleteReservation = async (id: string): Promise<void> => {
    try {
      const reservationRef = doc(db, "reservations", id);
      await deleteDoc(reservationRef);

      // Refresh reservations list
      await fetchReservations();
    } catch (err) {
      console.error(`Error deleting reservation ${id}:`, err);
      setError("Error al eliminar la reserva. Por favor intenta nuevamente.");
      throw err;
    }
  };

  const refreshReservations = async (): Promise<void> => {
    await fetchReservations();
  };

  // Function to generate test reservations
  const generateTestReservations = async (count: number): Promise<void> => {
    try {
      setLoading(true);

      const mealOptions: Meal[] = [
        { name: "Bife", prepTime: 25, status: "pending" },
        { name: "Pasta", prepTime: 15, status: "pending" },
        { name: "Salmón", prepTime: 20, status: "pending" },
        { name: "Hamburguesa", prepTime: 12, status: "pending" },
        { name: "Risotto", prepTime: 22, status: "pending" },
        { name: "Pizza", prepTime: 18, status: "pending" },
      ];

      const customerNames = [
        "Familia Smith",
        "Grupo Johnson",
        "Grupo Williams",
        "Reserva Brown",
        "Cena Jones",
        "Celebración Miller",
        "Reunión Davis",
        "Aniversario Garcia",
        "Grupo Rodriguez",
        "Grupo Wilson",
      ];

      const batch = [];

      // Get current date
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      for (let i = 0; i < count; i++) {
        // Random time between now and 7 days in the future
        const futureDate = new Date(today);
        futureDate.setDate(today.getDate() + Math.floor(Math.random() * 7));
        futureDate.setHours(
          Math.floor(Math.random() * 12) + 8, // Between 8am and 8pm
          Math.floor(Math.random() * 60),
          0
        );

        // Generate 1-3 meals per reservation
        const mealCount = Math.floor(Math.random() * 3) + 1;
        const meals: Meal[] = [];

        for (let j = 0; j < mealCount; j++) {
          const randomMeal =
            mealOptions[Math.floor(Math.random() * mealOptions.length)];
          meals.push({ ...randomMeal });
        }

        // Create reservation
        const reservationData = {
          customerId: `test-customer-${i}`,
          customerName:
            customerNames[Math.floor(Math.random() * customerNames.length)],
          table: `table-${Math.floor(Math.random() * 8) + 1}`,
          time: futureDate,
          people: Math.floor(Math.random() * 6) + 1,
          meals,
          status: "pending",
        } as Omit<Reservation, "id">;

        batch.push(createReservation(reservationData));
      }

      await Promise.all(batch);

      // Refresh the list after creating test data
      await fetchReservations();
    } catch (err) {
      console.error("Error generating test reservations:", err);
      setError("Failed to generate test data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const value: ReservationsContextType = {
    reservations,
    loading,
    error,
    getReservation,
    getReservationsByDate,
    getReservationsByTable,
    createReservation,
    updateReservation,
    deleteReservation,
    refreshReservations,
    generateTestReservations,
  };

  return (
    <ReservationsContext.Provider value={value}>
      {children}
    </ReservationsContext.Provider>
  );
}
