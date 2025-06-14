"use client";

import { useState, useEffect } from "react";
import { format, addHours, startOfDay, addDays, isSameDay } from "date-fns";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

// Sample data for reservations
const generateReservations = (startDate: Date): Reservation[] => {
  const reservations: Reservation[] = [];
  const startTime = startOfDay(startDate);
  const tables = [1, 2, 3, 4, 5, 6, 7, 8];
  const mealOptions = [
    { name: "Bife", prepTime: 25, status: "pending" },
    { name: "Pasta", prepTime: 15, status: "pending" },
    { name: "Salmón", prepTime: 20, status: "pending" },
    { name: "Hamburguesa", prepTime: 12, status: "pending" },
    { name: "Risotto", prepTime: 22, status: "pending" },
    { name: "Pizza", prepTime: 18, status: "pending" },
  ];
  const customers = [
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

  for (let i = 0; i < 10; i++) {
    const reservationTime = addHours(
      startTime,
      Math.floor(Math.random() * 12) + 8
    ); // Between 8 AM and 8 PM
    const mealCount = Math.floor(Math.random() * 3) + 1; // 1-3 meals per reservation
    const meals: Meal[] = [];

    for (let j = 0; j < mealCount; j++) {
      const meal: Meal = {
        name: mealOptions[Math.floor(Math.random() * mealOptions.length)].name,
        prepTime:
          mealOptions[Math.floor(Math.random() * mealOptions.length)].prepTime,
        status: "pending",
      };

      // Randomly assign status based on time
      const currentTime = new Date();
      const timeDiff = reservationTime.getTime() - currentTime.getTime();
      const hoursDiff = timeDiff / (1000 * 60 * 60);

      if (hoursDiff < 0) {
        meal.status = "completed";
      } else if (hoursDiff < 0.5) {
        meal.status = "in-progress";
      } else if (hoursDiff < 1) {
        meal.status = "urgent";
      } else if (hoursDiff < 2) {
        meal.status = "upcoming";
      } else {
        meal.status = "pending";
      }

      meals.push(meal);
    }

    reservations.push({
      id: `res-${i}`,
      customer: customers[Math.floor(Math.random() * customers.length)],
      table: String(tables[Math.floor(Math.random() * tables.length)]),
      time: reservationTime,
      meals,
      status: "confirmed",
    });
  }

  return reservations.sort((a, b) => a.time.getTime() - b.time.getTime());
};

export function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [selectedReservation, setSelectedReservation] =
    useState<Reservation | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);

  useEffect(() => {
    setReservations(generateReservations(currentDate));
  }, [currentDate]);

  const filteredReservations = reservations
    .filter((reservation) => {
      if (selectedFilter === "all") return true;
      if (selectedFilter === "upcoming") {
        return reservation.meals.some(
          (meal: Meal) =>
            meal.status === "upcoming" || meal.status === "pending"
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
    })
    .filter((reservation) => {
      return isSameDay(reservation.time, currentDate);
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
                          {reservation.customer}
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
                          {reservation.meals.length}{" "}
                          {reservation.meals.length === 1
                            ? "pedido"
                            : "pedidos"}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-3 mt-3">
                        {reservation.meals.map((meal, index) => (
                          <div key={index} className="flex items-center gap-2">
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
