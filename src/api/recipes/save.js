import { connectDB } from '../../utils/db';
import Recipe from '../../models/Recipe';
import { requireAuth } from '@clerk/clerk-sdk-node';

export default requireAuth(async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await connectDB();

    const { userId, recipe } = req.body;

    // Verify the authenticated user matches the request
    if (req.auth.userId !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const existingRecipe = await Recipe.findOne({
      userId,
      recipeId: recipe.id
    });

    if (existingRecipe) {
      return res.status(400).json({ message: 'Recipe already saved' });
    }

    const newRecipe = new Recipe({
      userId,
      recipeId: recipe.id,
      label: recipe.label,
      image: recipe.image,
      source: recipe.source,
      url: recipe.url,
      calories: recipe.calories,
      totalTime: recipe.totalTime,
      ingredients: recipe.ingredients,
      dietLabels: recipe.dietLabels,
      healthLabels: recipe.healthLabels
    });

    await newRecipe.save();

    res.status(201).json({ message: 'Recipe saved successfully' });
  } catch (error) {
    console.error('Error saving recipe:', error);
    res.status(500).json({ message: 'Error saving recipe' });
  }
}); 