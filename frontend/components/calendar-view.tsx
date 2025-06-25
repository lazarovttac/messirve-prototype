"use client";

import { useState, useEffect } from "react";
import { format, addDays, isSameDay, startOfDay } from "date-fns";
import { AlertCircle, ChevronLeft, ChevronRight, Filter } from "lucide-react";
import { es } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MealPreparationPanel } from "@/components/meal-preparation-panel";
import { ReservationDetails } from "@/components/reservation-details";
import { FoodIcon } from "@/components/food-icon";
import { Meal, Reservation } from "@/lib/types";
import { useReservations } from "@/contexts/ReservationsContext";

export function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [selectedReservation, setSelectedReservation] =
    useState<Reservation | null>(null);

  // Get reservations from context
  const {
    reservations,
    loading,
    error,
    getReservationsByDate,
    refreshReservations,
  } = useReservations();

  // State for current day's reservations
  const [currentDayReservations, setCurrentDayReservations] = useState<
    Reservation[]
  >([]);

  // Load reservations for the selected date
  useEffect(() => {
    const loadReservations = async () => {
      try {
        const dateReservations = await getReservationsByDate(currentDate);
        setCurrentDayReservations(dateReservations);
      } catch (err) {
        console.error("Error loading reservations for date:", err);
      }
    };

    loadReservations();
  }, [currentDate, getReservationsByDate]);

  // // Refresh reservations when the component mounts
  // useEffect(() => {
  //   refreshReservations();
  // }, [refreshReservations]);

  const filteredReservations = currentDayReservations.filter((reservation) => {
    if (selectedFilter === "all") return true;
    if (selectedFilter === "upcoming") {
      return reservation.meals.some(
        (meal: Meal) => meal.status === "upcoming" || meal.status === "pending"
      );
    }
    if (selectedFilter === "in-progress") {
      return reservation.meals.some(
        (meal: Meal) => meal.status === "in-progress"
      );
    }
    if (selectedFilter === "urgent") {
      return reservation.meals.some((meal: Meal) => meal.status === "urgent");
    }
    return true;
  });

  const handlePrevDay = () => {
    setCurrentDate((prev) => addDays(prev, -1));
  };

  const handleNextDay = () => {
    setCurrentDate((prev) => addDays(prev, 1));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "urgent":
        return "bg-status-urgent";
      case "upcoming":
        return "bg-status-upcoming";
      case "in-progress":
        return "bg-status-in-progress";
      case "completed":
        return "bg-status-completed";
      default:
        return "bg-status-pending";
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePrevDay}
            className="rounded-xl h-10 w-10 shadow-sm"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-xl font-bold">
            {format(currentDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
          </h2>
          <Button
            variant="outline"
            size="icon"
            onClick={handleNextDay}
            className="rounded-xl h-10 w-10 shadow-sm"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 rounded-xl h-10"
              >
                <Filter className="h-4 w-4" />
                Filtrar
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="rounded-xl">
              <DropdownMenuLabel>Filtrar Pedidos</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setSelectedFilter("all")}>
                Todos los Pedidos
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedFilter("upcoming")}>
                Próximos
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setSelectedFilter("in-progress")}
              >
                En Preparación
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedFilter("urgent")}>
                Urgentes
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button size="sm" className="rounded-xl">
            Nueva Reserva
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card className="shadow-md rounded-2xl border-none">
            <CardHeader className="pb-2">
              <CardTitle>Reservas</CardTitle>
              <CardDescription>
                {filteredReservations.length} reservas para el{" "}
                {format(currentDate, "d 'de' MMMM", { locale: es })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
              ) : error ? (
                <div className="bg-red-50 p-4 rounded-lg text-red-600">
                  Error al cargar reservas. Por favor intenta nuevamente.
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredReservations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <div className="text-muted-foreground">
                        No se encontraron reservas
                      </div>
                    </div>
                  ) : (
                    filteredReservations.map((reservation) => (
                      <div
                        key={reservation.id}
                        className="flex flex-col border rounded-xl p-4 cursor-pointer hover:bg-accent/50 transition-colors shadow-sm"
                        onClick={() => setSelectedReservation(reservation)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="font-medium">
                            {reservation.customerName}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {format(reservation.time, "HH:mm")}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="rounded-lg">
                            Mesa {reservation.table}
                          </Badge>
                          <div className="text-sm text-muted-foreground">
                            {reservation.people} personas |{" "}
                            {reservation.meals.length}{" "}
                            {reservation.meals.length === 1
                              ? "pedido"
                              : "pedidos"}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-3 mt-3">
                          {reservation.meals.map((meal, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-2"
                            >
                              <FoodIcon foodType={meal.name} size="sm" />
                              <span className="text-sm">{meal.name}</span>
                            </div>
                          ))}
                        </div>
                        {reservation.meals.some(
                          (meal) => meal.status === "urgent"
                        ) && (
                          <div className="flex items-center gap-1 mt-3 text-status-urgent text-sm">
                            <AlertCircle className="h-4 w-4" />
                            <span>Preparación urgente necesaria</span>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          {selectedReservation ? (
            <ReservationDetails
              reservation={selectedReservation}
              onClose={() => setSelectedReservation(null)}
            />
          ) : (
            <MealPreparationPanel reservations={filteredReservations} />
          )}
        </div>
      </div>
    </div>
  );
}
