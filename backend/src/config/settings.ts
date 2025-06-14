import dotenv from "dotenv";

dotenv.config();

export interface Settings {
  // Server settings
  host: string;
  port: number;
  nodeEnv: string;

  // Firebase settings
  firebaseServiceAccountKeyPath: string;
  firebaseAppName: string;

  // Google API settings
  googleApiKey: string;

  // CORS settings
  corsOrigins: string[];

  // ChatBot settings
  modelName: string;
  temperature: number;
  maxTokens: number;

  // Telegram settings
  telegramBotToken: string;
}

export const settings: Settings = {
  host: process.env.HOST || "0.0.0.0",
  port: parseInt(process.env.PORT || "7001", 10),
  nodeEnv: process.env.NODE_ENV || "development",

  firebaseServiceAccountKeyPath:
    process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH || "./firebase_key.json",
  firebaseAppName: process.env.FIREBASE_APP_NAME || "nodejs-main",

  googleApiKey: process.env.GOOGLE_API_KEY || "",

  corsOrigins: process.env.CORS_ORIGINS?.split(",") || [
    "http://localhost:3000",
    "http://192.168.0.9:3000",
  ],

  modelName: process.env.MODEL_NAME || "gemini-2.0-flash",
  temperature: parseFloat(process.env.MODEL_TEMPERATURE || "0.5"),
  maxTokens: parseInt(process.env.MODEL_MAX_TOKENS || "1000", 10),

  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || "",
};

// Validate required environment variables
if (!settings.googleApiKey) {
  throw new Error("GOOGLE_API_KEY is required but not provided");
}

export default settings;
