"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { db } from "@/lib/firebase";
import { Table } from "@/lib/types";
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
} from "firebase/firestore";

interface TablesContextType {
  tables: Table[];
  loading: boolean;
  error: string | null;
  getTable: (id: string) => Promise<Table | null>;
  createTable: (tableData: Omit<Table, "id">) => Promise<string>;
  updateTable: (
    id: string,
    tableData: Partial<Omit<Table, "id">>
  ) => Promise<void>;
  deleteTable: (id: string) => Promise<void>;
  refreshTables: () => Promise<void>;
}

const TablesContext = createContext<TablesContextType | undefined>(undefined);

export const useTables = () => {
  const context = useContext(TablesContext);
  if (!context) {
    throw new Error("useTables must be used within a TablesProvider");
  }
  return context;
};

interface TablesProviderProps {
  children: ReactNode;
}

export const TablesProvider: React.FC<TablesProviderProps> = ({ children }) => {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTables = async () => {
    try {
      setLoading(true);
      setError(null);

      const tablesCollection = collection(db, "tables");
      const tablesQuery = query(tablesCollection, orderBy("name"));
      const querySnapshot = await getDocs(tablesQuery);

      const tablesData: Table[] = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Table, "id">),
      }));

      setTables(tablesData);
    } catch (err) {
      console.error("Error fetching tables:", err);
      setError("Failed to load tables. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  const getTable = async (id: string): Promise<Table | null> => {
    try {
      const tableRef = doc(db, "tables", id);
      const tableDoc = await getDoc(tableRef);

      if (tableDoc.exists()) {
        return { id: tableDoc.id, ...(tableDoc.data() as Omit<Table, "id">) };
      }

      return null;
    } catch (err) {
      console.error(`Error getting table ${id}:`, err);
      setError(`Failed to retrieve table. Please try again.`);
      return null;
    }
  };

  const createTable = async (tableData: Omit<Table, "id">): Promise<string> => {
    try {
      const tablesCollection = collection(db, "tables");
      const docRef = await addDoc(tablesCollection, tableData);

      // Refresh tables list
      await fetchTables();

      return docRef.id;
    } catch (err) {
      console.error("Error creating table:", err);
      setError("Failed to create table. Please try again.");
      throw err;
    }
  };

  const updateTable = async (
    id: string,
    tableData: Partial<Omit<Table, "id">>
  ): Promise<void> => {
    try {
      const tableRef = doc(db, "tables", id);
      await updateDoc(tableRef, tableData);

      // Refresh tables list
      await fetchTables();
    } catch (err) {
      console.error(`Error updating table ${id}:`, err);
      setError("Failed to update table. Please try again.");
      throw err;
    }
  };

  const deleteTable = async (id: string): Promise<void> => {
    try {
      const tableRef = doc(db, "tables", id);
      await deleteDoc(tableRef);

      // Refresh tables list
      await fetchTables();
    } catch (err) {
      console.error(`Error deleting table ${id}:`, err);
      setError("Failed to delete table. Please try again.");
      throw err;
    }
  };

  const refreshTables = async (): Promise<void> => {
    await fetchTables();
  };

  const value: TablesContextType = {
    tables,
    loading,
    error,
    getTable,
    createTable,
    updateTable,
    deleteTable,
    refreshTables,
  };

  return (
    <TablesContext.Provider value={value}>{children}</TablesContext.Provider>
  );
};
