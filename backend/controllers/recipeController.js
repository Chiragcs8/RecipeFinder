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
    console.log('Save recipe request received:', req.body);
    const { userId, recipeId, recipe } = req.body;

    if (!userId || !recipeId || !recipe) {
      console.log('Missing required fields:', { userId, recipeId, hasRecipe: !!recipe });
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    let user = await User.findOne({ userId });
    if (!user) {
      console.log('Creating new user:', userId);
      user = new User({ userId, recipes: [] });
    }

    const isRecipeSaved = user.recipes.some(r => r.recipeId === recipeId);
    if (isRecipeSaved) {
      console.log('Recipe already saved:', recipeId);
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
    console.log('Recipe saved successfully:', recipeId);

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
    console.log('Unsave recipe request received:', req.params);
    const { userId, recipeId } = req.params;

    const user = await User.findOne({ userId });
    if (!user) {
      console.log('User not found:', userId);
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.recipes = user.recipes.filter(r => r.recipeId !== recipeId);
    await user.save();
    console.log('Recipe unsaved successfully:', recipeId);

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
    console.log('Get saved recipes request received:', req.params);
    const { userId } = req.params;

    const user = await User.findOne({ userId });
    if (!user) {
      console.log('User not found, returning empty recipes array:', userId);
      return res.json({ success: true, recipes: [] });
    }

    console.log('Found saved recipes for user:', userId, 'Count:', user.recipes.length);
    res.json({ success: true, recipes: user.recipes });
  } catch (error) {
    console.error('Error fetching saved recipes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch saved recipes'
    });
  }
}; 