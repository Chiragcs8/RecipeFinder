import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { createServer } from 'http';

dotenv.config();

const app = express();
const DEFAULT_PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Function to check if a port is available
const isPortAvailable = (port) => {
  return new Promise((resolve) => {
    const server = createServer();
    
    server.once('error', () => {
      resolve(false);
    });
    
    server.once('listening', () => {
      server.close();
      resolve(true);
    });
    
    server.listen(port);
  });
};

// Function to find an available port
const findAvailablePort = async (startPort) => {
  let currentPort = startPort;
  const maxPort = startPort + 100; // Try up to 100 ports ahead
  
  while (currentPort <= maxPort) {
    if (await isPortAvailable(currentPort)) {
      return currentPort;
    }
    currentPort++;
  }
  
  throw new Error('No available ports found');
};

// User Schema
const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true
  },
  recipes: [{
    recipeId: String,
    label: String,
    image: String,
    source: String,
    url: String,
    calories: Number,
    totalTime: Number,
    ingredients: Array,
    dietLabels: Array,
    healthLabels: Array,
    savedAt: {
      type: Date,
      default: Date.now
    }
  }]
});

const User = mongoose.model('User', userSchema);

// Helper function to extract recipe ID
const extractRecipeId = (uri) => {
  if (uri.includes('#recipe_')) {
    return uri.split('#recipe_')[1];
  } else if (uri.includes('_')) {
    return uri.split('_')[1];
  }
  return uri;
};

// Save Recipe Endpoint
app.post('/api/recipes/save', async (req, res) => {
  try {
    const { userId, recipeId, recipe } = req.body;

    if (!userId || !recipeId || !recipe) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Find or create user
    let user = await User.findOne({ userId });
    if (!user) {
      user = new User({ userId, recipes: [] });
    }

    // Check if recipe is already saved
    const isRecipeSaved = user.recipes.some(r => r.recipeId === recipeId);
    if (isRecipeSaved) {
      return res.status(400).json({ 
        success: false, 
        message: 'Recipe is already saved' 
      });
    }

    // Add new recipe to user's recipes array
    const recipeToSave = {
      ...recipe,
      recipeId: recipeId,
      savedAt: new Date()
    };
    user.recipes.push(recipeToSave);
    await user.save();

    res.json({ success: true });
  } catch (error) {
    console.error('Error saving recipe:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to save recipe' 
    });
  }
});

// Unsave Recipe Endpoint
app.delete('/api/recipes/unsave/:userId/:recipeId', async (req, res) => {
  try {
    const { userId, recipeId } = req.params;

    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Remove the recipe from user's recipes array
    user.recipes = user.recipes.filter(r => r.recipeId !== recipeId);
    await user.save();

    res.json({ success: true });
  } catch (error) {
    console.error('Error unsaving recipe:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unsave recipe'
    });
  }
});

// Get Saved Recipes Endpoint
app.get('/api/recipes/saved/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findOne({ userId });
    if (!user) {
      return res.json({ success: true, recipes: [] });
    }

    res.json({ success: true, recipes: user.recipes });
  } catch (error) {
    console.error('Error fetching saved recipes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch saved recipes'
    });
  }
});

// Routes
app.get('/', (req, res) => {
  res.send('Recipe Finder API is running');
});

// Start server with port checking
const startServer = async () => {
  try {
    const port = await findAvailablePort(DEFAULT_PORT);
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
  }
};

startServer(); 