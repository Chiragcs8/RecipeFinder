import api from './config.js';

export const saveRecipe = async (userId, recipeId, recipe) => {
  try {
    console.log('Attempting to save recipe:', { userId, recipeId });
    const response = await api.post('/recipes/save', {
      userId,
      recipeId,
      recipe
    });
    console.log('Save recipe response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error saving recipe:', error.response?.data || error.message);
    throw error;
  }
};

export const unsaveRecipe = async (userId, recipeId) => {
  try {
    console.log('Attempting to unsave recipe:', { userId, recipeId });
    const response = await api.delete(`/recipes/unsave/${userId}/${recipeId}`);
    console.log('Unsave recipe response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error unsaving recipe:', error.response?.data || error.message);
    throw error;
  }
};

export const getSavedRecipes = async (userId) => {
  try {
    console.log('Attempting to fetch saved recipes for user:', userId);
    const response = await api.get(`/recipes/saved/${userId}`);
    console.log('Get saved recipes response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching saved recipes:', error.response?.data || error.message);
    throw error;
  }
}; 