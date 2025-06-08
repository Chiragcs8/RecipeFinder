import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import recipeRoutes from './backend/routes/recipeRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((e) => console.log("MongoDB connection error:", e));

// Routes
app.use('/api/recipes', recipeRoutes);

// Health check route
app.get('/', (req, res) => {
  res.send('Recipe Finder API is running');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
