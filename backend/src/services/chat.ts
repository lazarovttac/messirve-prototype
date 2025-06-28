import { GoogleGenAI, Part, FunctionCall } from "@google/genai";
import { Settings } from "../config/settings";
import { DatabaseService } from "./database";
import { ReservationTools, ToolFunction, bindToolsToInstance } from "./tools";
import { Customer, Reservation, Meal, RestaurantConfig } from "../lib/types";
import path from "path";
import fs from "fs";

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

export interface ChatHistory {
  role: string;
  parts: Part[];
}

export interface TelegramUser {
  id: string;
  name: string;
  phoneNumber: string;
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
    const promptPath = path.join(__dirname, "../prompts/chat.xml");
    try {
      let prompt = fs.readFileSync(promptPath, "utf-8");
      const now = new Date();
      // Cargar datos del restaurante
      const rc = this.restaurantConfig;

      // Formatear fecha actual
      const currentDateTime = now.toLocaleString("es-ES", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        timeZoneName: "short",
      });

      // Reemplazar datos del restaurante en formato XML
      if (rc) {
        const restaurantData = `
          <name>${rc.name || ""}</name>
          <address>${rc.address || ""}</address>
          <Maps_link>${rc.googleMaps || ""}</Maps_link>
          <description>${rc.description || ""}</description>
          <social_media_links>${JSON.stringify(
            rc.socialMedia || {}
          )}</social_media_links>
          <online_menu_link>${rc.menuOnline || ""}</online_menu_link>
          <menu_details>${this.buildMenuXML(rc.menu)}</menu_details>`;

        prompt = prompt.replace(
          /(<restaurant_info>)([\s\S]*?)(<\/restaurant_info>)/,
          `$1${restaurantData}$3`
        );
      }

      // Obtener y formatear reservas actuales del cliente
      const reservations = await this.db.getReservationsByCustomer(customerId);
      const reservationsXML = this.formatReservationsAsXML(reservations);
      prompt = prompt.replace("{{reservasCliente}}", reservationsXML);
      prompt = prompt.replace("{{currentDateTime}}", currentDateTime);

      // Guardar prompt final para debugging
      const debugPath = path.join(
        __dirname,
        "../prompts/debug_last_prompt.xml"
      );
      fs.writeFileSync(debugPath, prompt, "utf-8");
      console.log("Prompt guardado para debug en:", debugPath);

      return prompt;
    } catch (error) {
      console.error("Error al procesar el prompt:", error);
      return `Eres Graciela, asistente de un restaurante. Ayudas a los clientes a hacer, modificar y cancelar reservas, y gestionar sus pedidos. Siempre confirma las acciones, pide aclaraciones si es necesario y sé educada.`;
    }
  }

  private buildMenuXML(menu: any[]): string {
    if (!menu || !Array.isArray(menu)) return "";
    return menu
      .map(
        (item) => `
      <menu_item>
        <name>${item.name || ""}</name>
        <description>${item.description || ""}</description>
        <price>${item.price || ""}</price>
        <type>${item.type || ""}</type>
      </menu_item>
    `
      )
      .join("");
  }

  private formatReservationsAsXML(reservations: Reservation[]): string {
    if (!reservations || !Array.isArray(reservations))
      return "<reservations></reservations>";

    const reservationsXML = reservations
      .map(
        (res) => `
        <reservation>
          <id>${res.id || ""}</id>
          <time>${new Date(res.time).toISOString() || ""}</time>
          <people>${res.people || ""}</people>
          <customer_id>${res.customerId || ""}</customer_id>
          <customer_name>${res.customerName || ""}</customer_name>
          <table>${res.table || ""}</table>
          <status>${res.status || ""}</status>
          ${
            res.meals
              ? `
          <meals>
            ${res.meals
              .map(
                (meal) => `
            <meal>
              <name>${meal.name || ""}</name>
              <prep_time>${meal.prepTime || ""}</prep_time>
              <status>${meal.status || ""}</status>
            </meal>
            `
              )
              .join("")}
          </meals>
          `
              : ""
          }
        </reservation>
      `
      )
      .join("");

    return `<reservations>${reservationsXML}</reservations>`;
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
