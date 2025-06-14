import admin from "firebase-admin";
import { Settings } from "./settings";
import * as fs from "fs";

export class FirebaseClient {
  private app: admin.app.App;
  private _db: admin.firestore.Firestore;
  private _timestamp: admin.firestore.FieldValue;

  constructor(settings: Settings) {
    this.app = this.initializeApp(
      settings.firebaseServiceAccountKeyPath,
      settings.firebaseAppName
    );
    this._db = admin.firestore(this.app);
    this._timestamp = admin.firestore.FieldValue.serverTimestamp();

    console.log(`Firebase app initialized: ${this.app.name}`);
  }

  get db(): admin.firestore.Firestore {
    return this._db;
  }

  get timestamp(): admin.firestore.FieldValue {
    return this._timestamp;
  }

  private initializeApp(credPath: string, appName: string): admin.app.App {
    try {
      // Try to get existing app
      const existingApp = admin.app(appName);
      console.log(`Found existing Firebase app: ${appName}`);
      return existingApp;
    } catch (error) {
      // No app exists, create a new one
      try {
        console.log(`Initializing new Firebase app with name: ${appName}`);
        console.log(`Using credentials file: ${credPath}`);

        if (!fs.existsSync(credPath)) {
          throw new Error(`Firebase credentials file not found: ${credPath}`);
        }

        const serviceAccount = JSON.parse(fs.readFileSync(credPath, "utf8"));
        const credential = admin.credential.cert(serviceAccount);

        const app = admin.initializeApp(
          {
            credential: credential,
          },
          appName
        );

        console.log(`Successfully initialized Firebase app: ${appName}`);
        return app;
      } catch (initError) {
        console.error(`Failed to initialize Firebase app: ${initError}`);
        throw initError;
      }
    }
  }

  isInitialized(): boolean {
    try {
      // Check if app exists
      const app = admin.app(this.app.name);
      if (!app) {
        console.error(`App ${this.app.name} not found`);
        return false;
      }

      return true;
    } catch (error) {
      console.error(`Firebase initialization check failed: ${error}`);
      return false;
    }
  }
}

let globalFirebaseClient: FirebaseClient | null = null;

export function createFirebaseClient(settings: Settings): FirebaseClient {
  if (!globalFirebaseClient) {
    globalFirebaseClient = new FirebaseClient(settings);
  }
  return globalFirebaseClient;
}

export function getFirebaseClient(): FirebaseClient {
  if (!globalFirebaseClient) {
    throw new Error(
      "Firebase client not initialized. Call createFirebaseClient first."
    );
  }
  return globalFirebaseClient;
}
