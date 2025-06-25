import { FunctionDeclaration, Type } from "@google/genai";
import { DatabaseService } from "./database";
import { Meal } from "../lib/types";

export interface ToolFunction {
  declaration: FunctionDeclaration;
  function: (...args: any[]) => Promise<string>;
}

export class ReservationTools {
  private db: DatabaseService;
  private customerId: string;

  constructor(db: DatabaseService, customerId: string) {
    this.db = db;
    this.customerId = customerId;
  }

  private async validateReservationTime(
    startTime: Date,
    customerId: string
  ): Promise<{ isValid: boolean; message: string }> {
    // Check if time is within operating hours (9 AM - 10 PM)
    const hour = startTime.getHours();
    if (hour < 9 || hour >= 22) {
      return {
        isValid: false,
        message:
          "Las reservas solo están disponibles entre las 9:00 AM y las 10:00 PM.",
      };
    }

    // Calculate end time (3 hours after start)
    const endTime = new Date(startTime.getTime() + 3 * 60 * 60 * 1000);

    // Check if end time is within operating hours
    if (endTime.getHours() >= 22) {
      return {
        isValid: false,
        message:
          "Esta reserva terminaría después del horario de cierre. Por favor, elige una hora más temprana.",
      };
    }

    // Check for overlapping reservations
    const overlappingReservations = await this.db.getOverlappingReservations(
      startTime,
      endTime,
      customerId
    );

    if (overlappingReservations.length > 0) {
      return {
        isValid: false,
        message:
          "Ya existe una reserva durante este horario. Por favor, elige un horario diferente.",
      };
    }

    return { isValid: true, message: "El horario está disponible." };
  }

  async createReservation({
    time,
    customerName,
    people,
    meals,
  }: {
    time: string;
    customerName: string;
    people: number;
    meals?: Meal[];
  }): Promise<string> {
    try {
      // Ensure time is a valid ISO string and customerName is trimmed
      const reservationTime = new Date(time);
      if (isNaN(reservationTime.getTime())) {
        return "La fecha y hora proporcionada no es válida.";
      }
      const trimmedName = customerName ? customerName.trim() : "";
      const validation = await this.validateReservationTime(
        reservationTime,
        this.customerId
      );
      if (!validation.isValid) {
        return validation.message;
      }
      const table = await this.db.assignTable(reservationTime, people); //modificado
      if (table.id == "-1") {
        return table.message;
      }
      const reservation = {
        customerId: this.customerId,
        customerName: trimmedName,
        people,
        table,
        time: reservationTime,
        meals: meals || [],
        status: "pending",
      };
      const id = await this.db.createReservation(reservation as any);
      return `Reserva creada para ${trimmedName} (${people} personas) el ${time} en la mesa ${table}.`;
    } catch (error) {
      return `Error al crear la reserva: ${error}`;
    }
  }

  async addMealToReservation({
    reservationId,
    meal,
  }: {
    reservationId: string;
    meal: Meal;
  }): Promise<string> {
    try {
      const reservation = await this.db.getReservationById(reservationId);
      if (!reservation) return "Reserva no encontrada.";
      const meals = reservation.meals || [];
      meals.push(meal);
      await this.db.updateReservation(reservationId, { meals });
      return `Plato '${meal.name}' añadido a tu reserva.`;
    } catch (error) {
      return `Error al añadir el plato: ${error}`;
    }
  }

  async cancelReservation({
    reservationId,
  }: {
    reservationId: string;
  }): Promise<string> {
    try {
      await this.db.updateReservation(reservationId, { status: "cancelled" });
      return "Tu reserva ha sido cancelada.";
    } catch (error) {
      return `Error al cancelar la reserva: ${error}`;
    }
  }

  async getReservationStatus({
    reservationId,
  }: {
    reservationId: string;
  }): Promise<string> {
    try {
      const reservation = await this.db.getReservationById(reservationId);
      if (!reservation) return "Reserva no encontrada.";
      return `La reserva para ${reservation.time} en la mesa ${reservation.table} está actualmente '${reservation.status}'.`;
    } catch (error) {
      return `Error al obtener el estado de la reserva: ${error}`;
    }
  }

  async changeReservationTime({
    reservationId,
    newTime,
  }: {
    reservationId: string;
    newTime: string;
  }): Promise<string> {
    try {
      const reservationTime = new Date(newTime);
      if (isNaN(reservationTime.getTime())) {
        return "La fecha y hora proporcionada no es válida.";
      }
      const validation = await this.validateReservationTime(
        reservationTime,
        this.customerId
      );
      if (!validation.isValid) {
        return validation.message;
      }
      const reservation = await this.db.getReservationById(reservationId);
      if (!reservation) {
        throw new Error('no existe una reservacion');
      }
      const tableAssignment = await this.db.assignTable(reservationTime, reservation.people);
      if (tableAssignment.id == "-1" ){
        throw new Error (tableAssignment.message);
      }
      else {
        const tables =  await this.db.getAllTables();
        let pincheMesaReservada;
        for (let table of tables) {
          if (table.id == tableAssignment.id) {
            pincheMesaReservada = table;
          }
        }
        if (pincheMesaReservada) {
          const table = String(pincheMesaReservada.id);
          await this.db.updateReservation(reservationId, {
            time: reservationTime,
            table
          });
        }

      }

      return `Horario de la reserva cambiado a ${newTime} en la mesa ${tableAssignment.id}.`;
    } catch (error) {
      return `Error al cambiar el horario de la reserva: ${error}`;
    }
  }

  async updateReservationDetails({
    reservationId,
    customerName,
    people,
  }: {
    reservationId: string;
    customerName?: string;
    people?: number;
  }): Promise<string> {
    try {
      const updateData: any = {};
      if (customerName) updateData.customerName = customerName.trim();
      if (people) updateData.people = people;
      await this.db.updateReservation(reservationId, updateData);
      return `Datos de la reserva actualizados.`;
    } catch (error) {
      return `Error al actualizar los datos de la reserva: ${error}`;
    }
  }

  async updateMealsInReservation({
    reservationId,
    meals,
  }: {
    reservationId: string;
    meals: Meal[];
  }): Promise<string> {
    try {
      const reservation = await this.db.getReservationById(reservationId);
      if (!reservation) return "Reserva no encontrada.";
      await this.db.updateReservation(reservationId, { meals });
      return `Las comidas de la reserva han sido actualizadas.`;
    } catch (error) {
      return `Error al actualizar las comidas de la reserva: ${error}`;
    }
  }
}

export function getToolDeclarations(): ToolFunction[] {
  return [
    {
      declaration: {
        name: "create_reservation",
        description:
          "Crea una nueva reserva para un cliente (puede incluir comidas)",
        parameters: {
          type: Type.OBJECT,
          properties: {
            time: {
              type: Type.STRING,
              description: "Fecha y hora de la reserva (ISO string)",
            },
            customerName: {
              type: Type.STRING,
              description: "Nombre de la persona que reserva",
            },
            people: {
              type: Type.NUMBER,
              description: "Cantidad de personas para la reserva",
            },
            meals: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  prepTime: { type: Type.NUMBER },
                  status: { type: Type.STRING },
                },
                required: ["name", "prepTime", "status"],
              },
              description: "Lista de platos (opcional)",
            },
          },
          required: ["time", "customerName", "people"],
        },
      },
      function: async (
        time: string,
        customerName: string,
        people: number,
        meals?: Meal[]
      ) => {
        throw new Error("Tools instance not bound");
      },
    },
    {
      declaration: {
        name: "add_meal_to_reservation",
        description: "Add a meal to an existing reservation",
        parameters: {
          type: Type.OBJECT,
          properties: {
            reservationId: { type: Type.STRING, description: "Reservation ID" },
            meal: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                prepTime: { type: Type.NUMBER },
                status: { type: Type.STRING },
              },
              required: ["name", "prepTime", "status"],
            },
          },
          required: ["reservationId", "meal"],
        },
      },
      function: async (reservationId: string, meal: Meal) => {
        throw new Error("Tools instance not bound");
      },
    },
    {
      declaration: {
        name: "cancel_reservation",
        description: "Cancel an existing reservation",
        parameters: {
          type: Type.OBJECT,
          properties: {
            reservationId: { type: Type.STRING, description: "Reservation ID" },
          },
          required: ["reservationId"],
        },
      },
      function: async (reservationId: string) => {
        throw new Error("Tools instance not bound");
      },
    },
    {
      declaration: {
        name: "get_reservation_status",
        description: "Get the status of a reservation",
        parameters: {
          type: Type.OBJECT,
          properties: {
            reservationId: { type: Type.STRING, description: "Reservation ID" },
          },
          required: ["reservationId"],
        },
      },
      function: async (reservationId: string) => {
        throw new Error("Tools instance not bound");
      },
    },
    {
      declaration: {
        name: "change_reservation_time",
        description: "Change the time of an existing reservation",
        parameters: {
          type: Type.OBJECT,
          properties: {
            reservationId: { type: Type.STRING, description: "Reservation ID" },
            newTime: {
              type: Type.STRING,
              description: "New reservation time (ISO string)",
            },
          },
          required: ["reservationId", "newTime"],
        },
      },
      function: async (reservationId: string, newTime: string) => {
        throw new Error("Tools instance not bound");
      },
    },
    {
      declaration: {
        name: "update_reservation_details",
        description:
          "Actualiza el nombre o la cantidad de personas de una reserva existente",
        parameters: {
          type: Type.OBJECT,
          properties: {
            reservationId: {
              type: Type.STRING,
              description: "ID de la reserva",
            },
            customerName: {
              type: Type.STRING,
              description: "Nuevo nombre (opcional)",
            },
            people: {
              type: Type.NUMBER,
              description: "Nueva cantidad de personas (opcional)",
            },
          },
          required: ["reservationId"],
        },
      },
      function: async (
        reservationId: string,
        customerName?: string,
        people?: number
      ) => {
        throw new Error("Tools instance not bound");
      },
    },
    {
      declaration: {
        name: "update_meals_in_reservation",
        description:
          "Actualiza la lista completa de comidas de una reserva existente",
        parameters: {
          type: Type.OBJECT,
          properties: {
            reservationId: {
              type: Type.STRING,
              description: "ID de la reserva",
            },
            meals: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  prepTime: { type: Type.NUMBER },
                  status: { type: Type.STRING },
                },
                required: ["name", "prepTime", "status"],
              },
              description: "Nueva lista de platos",
            },
          },
          required: ["reservationId", "meals"],
        },
      },
      function: async (reservationId: string, meals: Meal[]) => {
        throw new Error("Tools instance not bound");
      },
    },
  ];
}

export function bindToolsToInstance(tools: ReservationTools): ToolFunction[] {
  const toolDeclarations = getToolDeclarations();
  return toolDeclarations.map((tool) => ({
    ...tool,
    function: async (args: any) => {
      switch (tool.declaration.name) {
        case "create_reservation":
          return await tools.createReservation(args);
        case "add_meal_to_reservation":
          return await tools.addMealToReservation(args);
        case "cancel_reservation":
          return await tools.cancelReservation(args);
        case "get_reservation_status":
          return await tools.getReservationStatus(args);
        case "change_reservation_time":
          return await tools.changeReservationTime(args);
        case "update_reservation_details":
          return await tools.updateReservationDetails(args);
        case "update_meals_in_reservation":
          return await tools.updateMealsInReservation(args);
        default:
          throw new Error(`Unknown tool: ${tool.declaration.name}`);
      }
    },
  }));
}
