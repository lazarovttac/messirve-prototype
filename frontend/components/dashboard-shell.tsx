"use client";

import type React from "react";

import { useState } from "react";
import { Calendar, Clock, Home, Settings, Users } from "lucide-react";

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
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [activeTab, setActiveTab] = useState("calendar");

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
                  isActive={activeTab === "dashboard"}
                  onClick={() => setActiveTab("dashboard")}
                  className="rounded-xl h-10"
                >
                  <Home className="h-5 w-5" />
                  <span>Inicio</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
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
                  isActive={activeTab === "reservations"}
                  onClick={() => setActiveTab("reservations")}
                  className="rounded-xl h-10"
                >
                  <Clock className="h-5 w-5" />
                  <span>Reservas</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={activeTab === "customers"}
                  onClick={() => setActiveTab("customers")}
                  className="rounded-xl h-10"
                >
                  <Users className="h-5 w-5" />
                  <span>Clientes</span>
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
          <div className="p-6">{children}</div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
