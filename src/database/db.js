import mongoose from "mongoose";

const MAX_RETRIES = 3; //Maximum number of times to retry connecting if MongoDB fails.
const RETRY_INTERVAL = 5000; // Wait time (5 seconds) between retry attempt

// This class encapsulates all database connection logic.
// Why use a class?
// Keeps connection logic organized
// Allows tracking state (retryCount, isConnected)
// Makes it reusable and easier to manage

class DatabaseConnection {
  constructor() {
    this.retryCount = 0; // Tracks how many retry attempts have been made
    this.isConnected = false; // Tracks current connection status

    // Configure mongoose settings or behavior
    // Prevents MongoDB from allowing unknown query fields
    // Helps avoid bugs and improves security
    mongoose.set("strictQuery", true);

    // mongoose connection events listeners
    // Fires when MongoDB connects successfully
    mongoose.connection.on("connected", () => {
      console.log("✅ MongoDB connected successfully");
      this.isConnected = true;
    });

    // Fires if MongoDB encounters an error
    mongoose.connection.on("error", (err) => {
      console.error("❌ MongoDB connection error:", err);
      this.isConnected = false;
    });

    // Fires when MongoDB disconnects (network issue, server down, etc.)
    mongoose.connection.on("disconnected", () => {
      console.log("⚠️ MongoDB disconnected");
      this.isConnected = false;
      this.handleDisconnection();
    });

    // Handle application termination
    // this two Ensures MongoDB connection is closed cleanly before app exits
    process.on("SIGINT", this.handleAppTermination.bind(this)); // Ctrl + C
    process.on("SIGTERM", this.handleAppTermination.bind(this)); // App termination (Docker, server shutdown)
  }

  // This is the main method used to connect to MongoDB.
  async connect() {
    try {
      // Ensures MongoDB URI exists
      if (!process.env.MONGO_URI) {
        throw new Error("MongoDB URI is not defined in environment variables");
      }

      const connectionOptions = {
        useNewUrlParser: true, // Uses modern MongoDB connection string parser
        useUnifiedTopology: true, // Uses new MongoDB engine
        maxPoolSize: 10, // Maximum simultaneous DB connections
        serverSelectionTimeoutMS: 5000, // Timeout if DB server not found
        socketTimeoutMS: 45000, // Close inactive connections
        family: 4, // Use IPv4 Forces IPv4 (avoids IPv6 issues)
      };

      // Logs MongoDB queries in development. Helps debugging
      if (process.env.NODE_ENV === "development") {
        mongoose.set("debug", true);
      }

      // Connects to MongoDB // Resets retry counter after success
      await mongoose.connect(process.env.MONGO_URI, connectionOptions);
      this.retryCount = 0; // Reset retry count on successful connection
    } catch (error) {
      console.error("Failed to connect to MongoDB:", error.message);
      // If connection fails → retry logic kicks in
      await this.handleConnectionError();
    }
  }

  async handleConnectionError() {
    // Checks if retries are still allowed
    if (this.retryCount < MAX_RETRIES) {
      this.retryCount++;
      console.log(
        `Retrying connection... Attempt ${this.retryCount} of ${MAX_RETRIES}`
      );
      // wait for 5 seconds
      await new Promise((resolve) => setTimeout(resolve, RETRY_INTERVAL));
      return this.connect();
    } else {
      console.error(
        `Failed to connect to MongoDB after ${MAX_RETRIES} attempts`
      );
      process.exit(1);
    }
  }

  // Automatically reconnects if MongoDB disconnects
  handleDisconnection() {
    if (!this.isConnected) {
      console.log("Attempting to reconnect to MongoDB...");
      this.connect();
    }
  }

// Closes MongoDB connection cleanly // Prevents memory leaks or hanging connections
  async handleAppTermination() {
    try {
      await mongoose.connection.close();
      console.log("MongoDB connection closed through app termination");
      process.exit(0); // 0 when we like to exit
    } catch (err) {
      console.error("Error during database disconnection:", err);
      process.exit(1); // 1 when it exit due to some error
    }
  }

  // Get the current connection status
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      readyState: mongoose.connection.readyState,
      host: mongoose.connection.host,
      name: mongoose.connection.name,
    };
  }
}

// Create a single instance // Only one database connection for the entire app 
// Prevents multiple MongoDB connections
const dbConnection = new DatabaseConnection();
// Export the connect function and the instance
export default dbConnection.connect.bind(dbConnection); // “No matter who calls this function, this will always be dbConnection.”
export const getDBStatus = dbConnection.getConnectionStatus.bind(dbConnection);
