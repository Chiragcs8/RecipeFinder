import User from '../models/User.js';

// Helper function to extract recipe ID
const extractRecipeId = (uri) => {
  if (uri.includes('#recipe_')) {
    return uri.split('#recipe_')[1];
  } else if (uri.includes('_')) {
    return uri.split('_')[1];
  }
  return uri;
};

export const saveRecipe = async (req, res) => {
  try {
    const { userId, recipeId, recipe } = req.body;

    if (!userId || !recipeId || !recipe) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    let user = await User.findOne({ userId });
    if (!user) {
      user = new User({ userId, recipes: [] });
    }

    const isRecipeSaved = user.recipes.some(r => r.recipeId === recipeId);
    if (isRecipeSaved) {
      return res.status(400).json({ 
        success: false, 
        message: 'Recipe is already saved' 
      });
    }

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
};

export const unsaveRecipe = async (req, res) => {
  try {
    const { userId, recipeId } = req.params;

    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

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
};

export const getSavedRecipes = async (req, res) => {
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
}; 