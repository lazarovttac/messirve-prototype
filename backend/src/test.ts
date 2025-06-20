import { createFirebaseClient } from "./config/firebase";
import { DatabaseService } from "./services/database";

// Load settings
const settings = require("./config/settings").settings;

// Initialize Firebase
console.log("Initializing Firebase client...");
const firebaseClient = createFirebaseClient(settings);
if (!firebaseClient.isInitialized()) {
  console.log("Firebase client initialization failed");
  process.exit(1);
}
console.log("Firebase client initialized successfully");

// Initialize services
console.log("Initializing Firebase services...");
const databaseService = new DatabaseService(firebaseClient);


async function main() {
  console.log("Assigning table...");
  await databaseService.assignTable(new Date());
  console.log("Table assigned successfully");
}

main();