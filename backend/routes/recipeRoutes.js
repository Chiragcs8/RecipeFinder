import express from 'express';
import { saveRecipe, unsaveRecipe, getSavedRecipes } from '../controllers/recipeController.js';

const router = express.Router();

// Save a recipe
router.post('/save', saveRecipe);

// Unsave a recipe
router.delete('/unsave/:userId/:recipeId', unsaveRecipe);

// Get saved recipes for a user
router.get('/saved/:userId', getSavedRecipes);

export default router; 