import React, { useState, useEffect } from 'react';
import { useUser, SignInButton, SignUpButton, UserButton } from "@clerk/clerk-react";
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const RecipeDetail = ({ recipe, onClose }) => {
  const { isSignedIn, user } = useUser();
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSavedRecipesClick = (e) => {
    if (!isSignedIn) {
      e.preventDefault();
      setSaveError('Please sign in to view saved recipes');
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
      return;
    }
    if (onClose) {
      onClose();
    }
  };

  useEffect(() => {
    // Check if recipe is already saved
    const checkIfSaved = async () => {
      if (isSignedIn) {
        try {
          const response = await axios.get(`http://localhost:5000/api/recipes/saved/${user.id}`);
          if (response.data.success) {
            // Extract recipe ID from URI - handle both formats
            const recipeId = recipe.uri.includes('#recipe_') 
              ? recipe.uri.split('#recipe_')[1]
              : recipe.uri.split('_')[1];
            
            const isRecipeSaved = response.data.recipes.some(
              r => r.recipeId === recipeId
            );
            setIsSaved(isRecipeSaved);
          }
        } catch (error) {
          console.error('Error checking saved status:', error);
          setMessage("Failed to check saved status. Please try again.");
          setShowMessage(true);
          setTimeout(() => setShowMessage(false), 2000);
        }
      }
    };

    checkIfSaved();
  }, [isSignedIn, user, recipe.uri]);

  const handleSaveRecipe = async () => {
    if (!isSignedIn) {
      setMessage("Please sign in to save recipes");
      setShowMessage(true);
      setTimeout(() => setShowMessage(false), 2000);
      return;
    }

    setSaving(true);
    try {
      // Extract recipe ID from URI - handle both formats
      const recipeId = recipe.uri.includes('#recipe_') 
        ? recipe.uri.split('#recipe_')[1]
        : recipe.uri.split('_')[1];

      if (!recipeId) {
        throw new Error('Invalid recipe ID');
      }

      if (isSaved) {
        // Remove recipe from database
        const response = await axios.delete(`http://localhost:5000/api/recipes/unsave/${user.id}/${recipeId}`);
        if (response.data.success) {
          setIsSaved(false);
          setMessage("Recipe unsaved");
        } else {
          throw new Error(response.data.message || 'Failed to unsave recipe');
        }
      } else {
        // Add recipe to database
        const response = await axios.post('http://localhost:5000/api/recipes/save', {
          userId: user.id,
          recipeId: recipeId,
          recipe: recipe
        });
        if (response.data.success) {
          setIsSaved(true);
          setMessage("Recipe saved");
        } else {
          throw new Error(response.data.message || 'Failed to save recipe');
        }
      }
    } catch (error) {
      console.error('Error saving/unsaving recipe:', error);
      setMessage(error.response?.data?.message || error.message || "Failed to save/unsave recipe. Please try again.");
    } finally {
      setSaving(false);
      setShowMessage(true);
      setTimeout(() => {
        setShowMessage(false);
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation Bar */}
      <header className="bg-black text-white w-full p-4 shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center" onClick={onClose}>
              <img 
                src="https://www.svgrepo.com/show/169724/burger.svg" 
                alt="recipe icon" 
                className="w-8 h-8 mr-3 cursor-pointer" 
              />
              <h1 className="text-xl font-bold cursor-pointer">Recipe Finder</h1>
            </Link>
            {isSignedIn && (
              <Link 
                to="/saved" 
                className="flex items-center space-x-2 text-white hover:text-yellow-500 transition-colors"
              >
                <svg 
                  className="w-5 h-5" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth="2" 
                    d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" 
                  />
                </svg>
                <span>Saved Recipes</span>
              </Link>
            )}
          </div>
          <div className="flex items-center space-x-4">
            {!isSignedIn ? (
              <>
                <SignInButton mode="modal">
                  <button className="px-4 py-2 text-white hover:text-yellow-500 transition-colors">
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="px-4 py-2 bg-yellow-500 text-black rounded-lg hover:bg-yellow-600 transition-colors">
                    Sign Up
                  </button>
                </SignUpButton>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <span className="text-white">Welcome, {user.firstName || 'User'}!</span>
                <UserButton afterSignOutUrl="/" />
              </div>
            )}
          </div>
        </div>
      </header>

      {showError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{saveError}</span>
        </div>
      )}

      {showMessage && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-black px-6 py-3 rounded-lg shadow-lg z-50">
          {message}
        </div>
      )}

      <div className="py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Recipe Header */}
            <div className="relative h-96">
              <img
                src={recipe.image}
                alt={recipe.label}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <h1 className="text-3xl font-bold mb-2">{recipe.label}</h1>
                <div className="flex items-center space-x-4">
                  <span>{Math.round(recipe.calories)} calories</span>
                  <span>•</span>
                  <span>{recipe.ingredients.length} ingredients</span>
                  {recipe.totalTime > 0 && (
                    <>
                      <span>•</span>
                      <span>{recipe.totalTime} mins</span>
                    </>
                  )}
                </div>
              </div>
              <button
                onClick={handleSaveRecipe}
                disabled={saving}
                className={`absolute top-4 right-4 p-2 rounded-full ${
                  isSaved ? 'bg-yellow-500' : 'bg-white'
                } shadow-lg hover:shadow-xl transition-all disabled:opacity-50`}
              >
                {saving ? (
                  <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  <svg
                    className={`w-6 h-6 ${isSaved ? 'text-black' : 'text-yellow-500'}`}
                    fill={isSaved ? "currentColor" : "none"}
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                    />
                  </svg>
                )}
              </button>
            </div>

            {/* Action Buttons */}
            <div className="p-6 border-b flex justify-between items-center">
              <div className="flex space-x-4">
                <a
                  href={recipe.url}
                  className="px-4 py-2 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors"
                >
                  View Full Recipe
                </a>
              </div>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-black transition-colors"
              >
                ← Back to Results
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
              {/* Left Column - Ingredients */}
              <div>
                <h2 className="text-xl font-semibold mb-4">Ingredients</h2>
                <ul className="space-y-2">
                  {recipe.ingredients.map((ingredient, index) => (
                    <li key={index} className="flex items-start">
                      <span className="h-5 w-5 rounded-full border-2 border-yellow-500 flex-shrink-0 mt-0.5 mr-3" />
                      <span>{ingredient.text}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Right Column - Nutrition, Health & Diet Labels */}
              <div>
                {/* Nutrition Section */}
                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-4">Nutrition</h2>
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <div className="text-3xl font-bold">{Math.round(recipe.calories / recipe.yield)}</div>
                        <div className="text-sm text-gray-600">CALORIES / SERVING</div>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold">{recipe.yield}</div>
                        <div className="text-sm text-gray-600">SERVINGS</div>
                      </div>
                    </div>

                    {/* Nutrients */}
                    <div className="space-y-4">
                      {recipe.totalNutrients && (
                        <>
                          {/* Fat */}
                          <div className="flex justify-between items-center">
                            <span className="font-medium">Fat</span>
                            <div className="text-right">
                              <span className="font-medium">
                                {Math.round(recipe.totalNutrients.FAT?.quantity / recipe.yield)}
                                {recipe.totalNutrients.FAT?.unit}
                              </span>
                              <span className="text-gray-600 ml-2">
                                {Math.round(recipe.totalDaily.FAT?.quantity / recipe.yield)}%
                              </span>
                            </div>
                          </div>
                          
                          {/* Saturated Fat */}
                          <div className="flex justify-between items-center pl-4 text-gray-600">
                            <span>Saturated</span>
                            <div className="text-right">
                              <span>
                                {Math.round(recipe.totalNutrients.FASAT?.quantity / recipe.yield)}
                                {recipe.totalNutrients.FASAT?.unit}
                              </span>
                              <span className="ml-2">
                                {Math.round(recipe.totalDaily.FASAT?.quantity / recipe.yield)}%
                              </span>
                            </div>
                          </div>

                          {/* Carbs */}
                          <div className="flex justify-between items-center">
                            <span className="font-medium">Carbs</span>
                            <div className="text-right">
                              <span className="font-medium">
                                {Math.round(recipe.totalNutrients.CHOCDF?.quantity / recipe.yield)}
                                {recipe.totalNutrients.CHOCDF?.unit}
                              </span>
                              <span className="text-gray-600 ml-2">
                                {Math.round(recipe.totalDaily.CHOCDF?.quantity / recipe.yield)}%
                              </span>
                            </div>
                          </div>

                          {/* Protein */}
                          <div className="flex justify-between items-center">
                            <span className="font-medium">Protein</span>
                            <div className="text-right">
                              <span className="font-medium">
                                {Math.round(recipe.totalNutrients.PROCNT?.quantity / recipe.yield)}
                                {recipe.totalNutrients.PROCNT?.unit}
                              </span>
                              <span className="text-gray-600 ml-2">
                                {Math.round(recipe.totalDaily.PROCNT?.quantity / recipe.yield)}%
                              </span>
                            </div>
                          </div>

                          {/* Cholesterol */}
                          <div className="flex justify-between items-center">
                            <span className="font-medium">Cholesterol</span>
                            <div className="text-right">
                              <span className="font-medium">
                                {Math.round(recipe.totalNutrients.CHOLE?.quantity / recipe.yield)}
                                {recipe.totalNutrients.CHOLE?.unit}
                              </span>
                              <span className="text-gray-600 ml-2">
                                {Math.round(recipe.totalDaily.CHOLE?.quantity / recipe.yield)}%
                              </span>
                            </div>
                          </div>

                          {/* Sodium */}
                          <div className="flex justify-between items-center">
                            <span className="font-medium">Sodium</span>
                            <div className="text-right">
                              <span className="font-medium">
                                {Math.round(recipe.totalNutrients.NA?.quantity / recipe.yield)}
                                {recipe.totalNutrients.NA?.unit}
                              </span>
                              <span className="text-gray-600 ml-2">
                                {Math.round(recipe.totalDaily.NA?.quantity / recipe.yield)}%
                              </span>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <h2 className="text-xl font-semibold mb-4">Health & Diet Info</h2>
                
                {recipe.dietLabels.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-medium mb-2">Diet</h3>
                    <div className="flex flex-wrap gap-2">
                      {recipe.dietLabels.map((label) => (
                        <span
                          key={label}
                          className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                        >
                          {label}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {recipe.healthLabels.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-medium mb-2">Health Labels</h3>
                    <div className="flex flex-wrap gap-2">
                      {recipe.healthLabels.map((label) => (
                        <span
                          key={label}
                          className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                        >
                          {label}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-6">
                  <h3 className="font-medium mb-2">Source</h3>
                  <p className="text-gray-600">{recipe.source}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeDetail; 