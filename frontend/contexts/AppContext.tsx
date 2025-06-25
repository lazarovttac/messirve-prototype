"use client";

import React, { ReactNode } from "react";
import { TablesProvider } from "@/contexts/TablesContext";
import { ReservationsProvider } from "@/contexts/ReservationsContext";

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  return (
    <TablesProvider>
      <ReservationsProvider>{children}</ReservationsProvider>
    </TablesProvider>
  );
};
