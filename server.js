import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { createServer } from 'http';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI) // Establishes a connection to the MongoDB database using the URI defined in the environment variable.
  .then(() => console.log("mongoose is connected")) // Logs a success message when the connection is successful.
  .catch((e) => console.log(e)); // Catches and logs any errors that occur during the connection process.



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

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  // Logs a message to confirm the server is running.
}); // Starts the Express server and listens for incoming requests on the specified port.
