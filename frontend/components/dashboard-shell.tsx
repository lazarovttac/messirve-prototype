// src/components/dashboard-shell.tsx
"use client";

import type React from "react";

import { useState } from "react";
import { Calendar, Settings } from "lucide-react"; //buscar si en la libreria de lucide react existe un icono de mesa

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button"; // Este no se usa en este componente, podrías quitarlo si no se usa más
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";


import { CalendarView } from "@/components/calendar-view"; 
import { TablesView } from "@/components/tables-view"; 
// import { SettingsView } from "@/components/settings-view"; // Si lo creas, impórtalo aquí

export function DashboardShell() { // Ya no necesita 'children' como prop externa
  const [activeTab, setActiveTab] = useState("calendar");

  // Función para renderizar el contenido basado en la pestaña activa
  const renderContent = () => {
    switch (activeTab) {
      case "calendar":
        return <CalendarView />;
      case "tables":
        return <TablesView />;
      case "settings":
        // return <SettingsView />; // Cuando la crees, descomenta y úsala
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Configuración</h2>
            <p>Aquí puedes gestionar las opciones de tu cuenta y restaurante.</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-slate-50">
        <Sidebar className="border-r shadow-sm">
          <SidebarHeader className="flex flex-row gap-2 items-center border-b px-4 py-2">
            <Image src="/logo.png" alt="Logo" width={32} height={32} />
            <span className="text-lg font-bold">Messirve</span>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={activeTab === "calendar"}
                  onClick={() => setActiveTab("calendar")}
                  className="rounded-xl h-10"
                >
                  <Calendar className="h-5 w-5" />
                  <span>Calendario</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={activeTab === "tables"}
                  onClick={() => setActiveTab("tables")}
                  className="rounded-xl h-10"
                >
                  <span>Gestor de mesas</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={activeTab === "settings"}
                  onClick={() => setActiveTab("settings")}
                  className="rounded-xl h-10"
                >
                  <Settings className="h-5 w-5" />
                  <span>Configuración</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="border-t p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src="/placeholder.svg?height=40&width=40" />
                  <AvatarFallback>JM</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">Juan Manager</div>
                  <div className="text-xs text-muted-foreground">
                    Restaurante Principal
                  </div>
                </div>
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset className="bg-slate-50">
          <div className="flex h-16 items-center border-b bg-white px-6 shadow-sm">
            <SidebarTrigger />
            <div className="ml-4 text-lg font-medium">Panel de Control</div>
          </div>
          <div className="p-6">
            {renderContent()}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}