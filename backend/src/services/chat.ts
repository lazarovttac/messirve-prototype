import { GoogleGenAI, Part, FunctionCall } from "@google/genai";
import { Settings } from "../config/settings";
import { DatabaseService } from "./database";
import { ReservationTools, ToolFunction, bindToolsToInstance } from "./tools";
import { Customer } from "../lib/types";
import * as fs from "fs";
import * as path from "path";

const RESTAURANT_CONFIG_PATH = path.join(
  __dirname,
  "../config/restaurant.json"
);

function loadRestaurantConfig() {
  try {
    const data = fs.readFileSync(RESTAURANT_CONFIG_PATH, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error al leer la configuración del restaurante:", error);
    return null;
  }
}

function buildMenuList(menu: any[]): string {
  if (!menu || menu.length === 0) return "(menú no disponible)";
  return menu.map((item) => `- ${item.nombre}: ${item.descripcion}`).join("\n");
}

export interface ChatHistory {
  role: string;
  parts: Part[];
}

export interface TelegramUser {
  id: string;
  name: string;
  phoneNumber: string;
}

function formatReservationsForPrompt(reservations: any[]): string {
  if (!reservations || reservations.length === 0)
    return "(No hay reservas actuales)";
  return reservations
    .map(
      (r) =>
        `ID: ${r.id}\n  Fecha: ${new Date(r.time).toLocaleString(
          "es-ES"
        )}\n  A nombre de: ${r.customerName}\n  Número de personas: ${
          r.people
        }\n  Mesa: ${r.table}\n  Estado: ${r.status}\n  Platos: ${
          r.meals && r.meals.length > 0
            ? r.meals.map((m: any) => m.name).join(", ")
            : "(sin comidas)"
        }`
    )
    .join("\n---\n");
}

export class ChatService {
  private google: GoogleGenAI;
  private settings: Settings;
  private db: DatabaseService;
  private conversationHistory: Map<string, ChatHistory[]>;
  private restaurantConfig: any;

  constructor(settings: Settings, db: DatabaseService) {
    this.settings = settings;
    this.db = db;
    this.google = new GoogleGenAI({ apiKey: settings.googleApiKey });
    this.conversationHistory = new Map();
    this.restaurantConfig = loadRestaurantConfig();
  }

  private async getSystemInstructionWithReservations(
    customerId: string
  ): Promise<string> {
    const promptPath = path.join(__dirname, "../prompts/chat.md");
    try {
      let prompt = fs.readFileSync(promptPath, "utf-8");
      const now = new Date();
      // Cargar datos del restaurante
      const rc = this.restaurantConfig;
      prompt = prompt.replace(
        "{{currentDateTime}}",
        now.toLocaleString("es-ES", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "numeric",
          minute: "numeric",
          timeZoneName: "short",
        })
      );
      if (rc) {
        prompt = prompt.replace("{{nombre}}", rc.nombre || "");
        prompt = prompt.replace("{{direccion}}", rc.direccion || "");
        prompt = prompt.replace("{{googleMaps}}", rc.googleMaps || "");
        prompt = prompt.replace("{{descripcion}}", rc.descripcion || "");
        prompt = prompt.replace("{{menuOnline}}", rc.menuOnline || "");
        prompt = prompt.replace("{{menuLista}}", buildMenuList(rc.menu));
      }
      // Obtener reservas actuales del cliente
      const reservations = await this.db.getReservationsByCustomer(customerId);
      console.log(reservations);
      prompt = prompt.replace(
        "{{reservasCliente}}",
        formatReservationsForPrompt(reservations)
      );
      return prompt;
    } catch (error) {
      console.error("Error al leer el archivo de prompt:", error);
      return `Eres Graciela, asistente de un restaurante. Ayudas a los clientes a hacer, modificar y cancelar reservas, y gestionar sus pedidos. Siempre confirma las acciones, pide aclaraciones si es necesario y sé educada.`;
    }
  }

  async processQuery(
    message: string,
    telegramUser: TelegramUser
  ): Promise<string> {
    try {
      // Find or create customer
      let customer: Customer | null = await this.db.getCustomerByPhone(
        telegramUser.phoneNumber
      );
      if (!customer) {
        const id = await this.db.createCustomer({
          name: telegramUser.name,
          phoneNumber: telegramUser.phoneNumber,
        });
        customer = {
          id,
          name: telegramUser.name,
          phoneNumber: telegramUser.phoneNumber,
        };
      }

      // Bind reservation tools to this customer
      const toolsInstance = new ReservationTools(this.db, customer.id);
      const boundTools = bindToolsToInstance(toolsInstance);

      // Get or initialize conversation history
      let history = this.conversationHistory.get(telegramUser.id) || [];

      // Add new message to history
      history.push({ role: "user", parts: [{ text: message }] });

      // Generate config with tools and fresh system instruction (con reservas) for every message
      const updatedConfig = {
        systemInstruction: await this.getSystemInstructionWithReservations(
          customer.id
        ),
        maxOutputTokens: this.settings.maxTokens,
        temperature: this.settings.temperature,
        tools: [
          {
            functionDeclarations: boundTools.map((t) => t.declaration),
          },
        ],
      };

      // Generate response
      const responseLLM = await this.google.models.generateContent({
        model: this.settings.modelName,
        contents: history,
        config: updatedConfig,
      });

      let finalResponse: string;
      if (!responseLLM) {
        throw new Error("No se recibió respuesta de la API de Gemini");
      }
      if (responseLLM.functionCalls && responseLLM.functionCalls.length > 0) {
        finalResponse = await this.handleFunctionCalls(
          responseLLM.functionCalls,
          boundTools,
          history,
          updatedConfig
        );
      } else {
        finalResponse =
          responseLLM.text || "Lo siento, no pude generar una respuesta.";
      }

      // Add assistant's response to history
      history.push({ role: "model", parts: [{ text: finalResponse }] });

      // Update conversation history
      this.conversationHistory.set(telegramUser.id, history);

      return finalResponse;
    } catch (error) {
      console.error("Error al procesar la consulta:", error);
      return `Error al procesar tu solicitud: ${error}`;
    }
  }

  private async handleFunctionCalls(
    functionCalls: FunctionCall[],
    boundTools: ToolFunction[],
    history: ChatHistory[],
    config: any
  ): Promise<string> {
    for (const functionCall of functionCalls) {
      const tool = boundTools.find(
        (t) => t.declaration.name === functionCall.name
      );
      if (!tool) {
        console.error(`Function ${functionCall.name} not found in bound tools`);
        continue;
      }
      try {
        const args = functionCall.args || {};
        console.log(`[TOOL] Calling ${functionCall.name} with args:`, args);
        const result = await tool.function(args);
        console.log(`[TOOL] ${functionCall.name} result:`, result);
        history.push({
          role: "model",
          parts: [{ functionCall: functionCall }],
        });
        history.push({
          role: "user",
          parts: [
            {
              functionResponse: {
                name: functionCall.name || "",
                response: { result },
              },
            },
          ],
        });
      } catch (error) {
        console.error(`[TOOL] Error executing ${functionCall.name}:`, error);
        history.push({
          role: "model",
          parts: [{ functionCall: functionCall }],
        });
        history.push({
          role: "user",
          parts: [
            {
              functionResponse: {
                name: functionCall.name || "",
                response: { error: `Error executing function: ${error}` },
              },
            },
          ],
        });
      }
    }

    // Generate final response with function results
    const finalResponse = await this.google.models.generateContent({
      model: this.settings.modelName,
      contents: history,
      config: config,
    });
    return (
      finalResponse.text || "Function executed, but no response generated."
    );
  }
}
