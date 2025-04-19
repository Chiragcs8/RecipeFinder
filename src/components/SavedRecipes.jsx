import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { SignInButton, SignUpButton } from '@clerk/clerk-react';

const SavedRecipes = () => {
  const { isSignedIn, user } = useUser();
  const [savedRecipes, setSavedRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSavedRecipes = async () => {
      if (isSignedIn) {
        try {
          setLoading(true);
          const response = await axios.get(`http://localhost:3002/api/recipes/saved/${user.id}`);
          if (response.data.success) {
            setSavedRecipes(response.data.recipes);
          }
        } catch (err) {
          console.error('Error fetching saved recipes:', err);
          setError('Failed to load saved recipes');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchSavedRecipes();
  }, [isSignedIn, user]);

  const handleRecipeClick = (recipe) => {
    // Ensure we have the recipe data in the correct format
    const recipeData = {
      recipe: {
        ...recipe,
        uri: recipe.uri || `#recipe_${recipe.recipeId}`,
        dietLabels: recipe.dietLabels || [],
        healthLabels: recipe.healthLabels || [],
        cautions: recipe.cautions || [],
        ingredientLines: recipe.ingredientLines || [],
        calories: recipe.calories || 0,
        totalWeight: recipe.totalWeight || 0,
        totalNutrients: recipe.totalNutrients || {},
        totalDaily: recipe.totalDaily || {},
        digest: recipe.digest || []
      }
    };
    navigate(`/recipe/${recipe.recipeId}`, { state: { recipe: recipeData } });
  };

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4">Please sign in to view saved recipes</h2>
          <div className="flex space-x-4">
            <SignInButton mode="modal">
              <button className="px-4 py-2 bg-yellow-500 text-black rounded-lg hover:bg-yellow-600 transition-colors">
                Sign In
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors">
                Sign Up
              </button>
            </SignUpButton>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-yellow-500 border-t-transparent"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4 text-red-500">{error}</h2>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-yellow-500 text-black rounded-lg hover:bg-yellow-600 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Saved Recipes</h1>
        {savedRecipes.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-gray-600">You haven't saved any recipes yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedRecipes.map((recipe, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleRecipeClick(recipe)}
              >
                <img
                  src={recipe.image}
                  alt={recipe.label}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-2">{recipe.label}</h3>
                  <p className="text-gray-600 text-sm">
                    {Math.round(recipe.calories)} calories • {recipe.ingredients.length} ingredients
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedRecipes; 