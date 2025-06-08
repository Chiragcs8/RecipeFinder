import dotenv from 'dotenv';
dotenv.config();

// Loads environment variables from a .env file into process.env for secure configuration.

import express from 'express';
// Imports the express framework to create a web server and handle routing.

import cors from 'cors';
// Imports CORS (Cross-Origin Resource Sharing) middleware to allow cross-origin requests.

import mongoose from 'mongoose';
// Imports mongoose to interact with MongoDB database.

import recipeRoutes from './backend/routes/recipeRoutes.js';

const app = express();
// Initializes an Express app instance to handle HTTP requests.

const PORT = process.env.PORT || 5000;
// Defines the port for the server to listen on. Defaults to 5000 if not defined in environment variables.

const MONGO_URI = process.env.MONGO_URI;
// Retrieves the MongoDB URI from environment variables to connect to the database.

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    // Defines the allowed origin (client URL) for requests.
    methods: ["GET", "POST", "DELETE", "PUT"],
    // Specifies the allowed HTTP methods for cross-origin requests.
    allowedHeaders: ["Content-Type", "Authorization"],
    // Defines the allowed headers in the request.
  })
  // Configures CORS options to control which domains can make requests to this server.
);

app.use(express.json());
// Middleware to parse incoming requests with JSON payloads.
console.log("🔍 MONGO_URI:", process.env.MONGO_URI);


// Database connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((e) => console.log("MongoDB connection error:", e));

// Routes
app.use('/api/recipes', recipeRoutes);

// Health check route
app.get('/', (req, res) => {
  res.send('Recipe Finder API is running');
});

app.use((err, req, res, next) => {
  console.log(err.stack);
  // Logs the error stack trace for debugging.
  res.status(500).json({
    success: false,
    // Indicates that the request was not successful.
    message: "something went wrong",
    // A generic error message to be sent back to the client.
  }); // Sends a 500 status code (Internal Server Error) response with a JSON error message.
}); // Error-handling middleware to catch and process errors during request handling.

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  // Logs a message to confirm the server is running.
}); // Starts the Express server and listens for incoming requests on the specified port.
