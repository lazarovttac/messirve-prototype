import { createFirebaseClient } from "./config/firebase";
import { DatabaseService } from "./services/database";
import { ChatService } from "./services/chat";
import { Telegraf } from "telegraf";
import type { Context } from "telegraf";

// Load settings
const settings = require("./config/settings").settings;

// Logging configuration
const ENABLE_LOGS = true;
const log = {
  info: (message: string, data?: any) => {
    if (ENABLE_LOGS) {
      console.log(`[INFO] ${message}`, data ? data : "");
    }
  },
  error: (message: string, error?: any) => {
    if (ENABLE_LOGS) {
      console.error(`[ERROR] ${message}`, error ? error : "");
    }
  },
  action: (action: string, details?: any) => {
    if (ENABLE_LOGS) {
      console.log(`[ACTION] ${action}`, details ? details : "");
    }
  },
  tool: (tool: string, params?: any) => {
    if (ENABLE_LOGS) {
      console.log(`[TOOL] ${tool}`, params ? params : "");
    }
  },
};

// Initialize Firebase
log.info("Initializing Firebase client...");
const firebaseClient = createFirebaseClient(settings);
if (!firebaseClient.isInitialized()) {
  log.error("Firebase client initialization failed");
  process.exit(1);
}
log.info("Firebase client initialized successfully");

// Initialize services
log.info("Initializing services...");
const databaseService = new DatabaseService(firebaseClient);
const chatService = new ChatService(settings, databaseService);
log.info("Services initialized successfully");

// Initialize Telegram bot
log.info("Initializing Telegram bot...");
const bot = new Telegraf(settings.telegramBotToken);

bot.on("text", async (ctx: Context) => {
  try {
    if (!ctx.from) {
      throw new Error("No user information available");
    }
    const message = (ctx.update as any).message?.text;
    if (!message) {
      throw new Error("Invalid message format");
    }

    log.info("Received message", {
      userId: ctx.from.id,
      username: ctx.from.username,
      message: message,
    });

    const telegramUser = {
      id: String(ctx.from.id),
      name:
        ctx.from.first_name +
        (ctx.from.last_name ? " " + ctx.from.last_name : ""),
      phoneNumber: ctx.from.username || ctx.from.id.toString(),
    };

    log.action("Processing user query", {
      userId: telegramUser.id,
      userName: telegramUser.name,
    });

    const response = await chatService.processQuery(message, telegramUser);

    log.info("Sending response", {
      userId: telegramUser.id,
      response: response,
    });

    await ctx.reply(response);
  } catch (error) {
    log.error("Error handling Telegram message:", error);
    await ctx.reply("Sorry, there was an error processing your request.");
  }
});

bot.launch().then(() => {
  log.info("Telegram bot started successfully!");
});

// Graceful shutdown
process.once("SIGINT", () => {
  log.info("Shutting down bot (SIGINT)...");
  bot.stop("SIGINT");
});

process.once("SIGTERM", () => {
  log.info("Shutting down bot (SIGTERM)...");
  bot.stop("SIGTERM");
});
