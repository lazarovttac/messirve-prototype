"use client";

import { format } from "date-fns";
import { AlertCircle, ArrowLeft, Clock, User } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { FoodIcon } from "@/components/food-icon";
import { MealStatus, Reservation } from "@/lib/types";

export function ReservationDetails({
  reservation,
  onClose,
}: {
  reservation: Reservation;
  onClose: () => void;
}) {
  const getStatusBadge = (status: MealStatus) => {
    switch (status) {
      case "urgent":
        return (
          <Badge variant="destructive" className="rounded-lg">
            Urgente
          </Badge>
        );
      case "in-progress":
        return (
          <Badge variant="secondary" className="rounded-lg">
            En Progreso
          </Badge>
        );
      case "upcoming":
        return (
          <Badge variant="outline" className="rounded-lg">
            Próximo
          </Badge>
        );
      case "completed":
        return (
          <Badge className="bg-status-completed text-white rounded-lg">
            Completado
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="rounded-lg">
            Pendiente
          </Badge>
        );
    }
  };

  const getProgressValue = (status: MealStatus) => {
    switch (status) {
      case "completed":
        return 100;
      case "in-progress":
        return 50;
      case "urgent":
        return 25;
      case "upcoming":
        return 10;
      default:
        return 0;
    }
  };

  const hasUrgentMeals = reservation.meals.some(
    (meal) => meal.status === "urgent"
  );

  return (
    <Card className="shadow-md rounded-2xl border-none">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-xl"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <CardTitle>Detalles de la Reserva</CardTitle>
        </div>
        <CardDescription>
          {format(reservation.time, "EEEE, d 'de' MMMM 'de' yyyy")} a las{" "}
          {format(reservation.time, "h:mm a")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col space-y-1.5">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{reservation.customerName}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-sm text-muted-foreground">Mesa</span>
            <span className="font-medium">
              {reservation.tableName || `Mesa ${reservation.table}`}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="rounded-lg">
              {reservation.meals.length}{" "}
              {reservation.meals.length === 1 ? "pedido" : "pedidos"}
            </Badge>
          </div>
        </div>
        <Separator />
        <div>
          <h3 className="font-medium mb-2">Preparación de Comidas</h3>
          <div className="space-y-3">
            {reservation.meals.map((meal, index) => (
              <div
                key={index}
                className="border rounded-xl p-3 space-y-2 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FoodIcon foodType={meal.name} size="sm" />
                    <div className="font-medium">{meal.name}</div>
                  </div>
                  {getStatusBadge(meal.status)}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {meal.prepTime} min de preparación
                  </span>
                </div>
                <Progress
                  value={getProgressValue(meal.status)}
                  className="h-2 rounded-lg"
                />
                {meal.status === "urgent" && (
                  <div className="flex items-center gap-1 text-status-urgent text-sm">
                    <AlertCircle className="h-4 w-4" />
                    <span>¡Comienza la preparación ahora!</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-4">
        <Button variant="outline" onClick={onClose} className="rounded-xl">
          Volver
        </Button>
        <div className="flex gap-2">
          <Button variant="secondary" className="rounded-xl">
            Editar reserva
          </Button>
          <Button variant="default" className="rounded-xl">
            Actualizar estado
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
