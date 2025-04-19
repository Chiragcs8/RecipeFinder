import React, { useState, useEffect } from 'react';
import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/clerk-react";
import { BrowserRouter as Router, Routes, Route, useNavigate, useParams, useLocation, Link } from 'react-router-dom';
import { fetchEdamamResponse } from './fetchEdamamResponse';
import RecipeComponent from './RecipeComponent';
import RecipeRating from './components/RecipeRating';
import ShoppingList from './components/ShoppingList';
import FavoriteRecipes from './components/FavoriteRecipes';
import RecipeDetail from './components/RecipeDetail';
import SavedRecipes from './components/SavedRecipes';

const NavigationBar = ({ onClose }) => {
  const { isSignedIn, user } = useUser();
  const navigate = useNavigate();
  const [showError, setShowError] = useState(false);

  const handleHomeClick = () => {
    // Clear session storage
    sessionStorage.removeItem('searchState');
    // Navigate to home
    navigate('/');
    // Call onClose if provided
    if (onClose) {
      onClose();
    }
  };

  const handleSavedRecipesClick = (e) => {
    if (!isSignedIn) {
      e.preventDefault();
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
      return;
    }
    if (onClose) {
      onClose();
    }
  };

  return (
    <>
      <header className="bg-black text-white w-full p-4 shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center" onClick={handleHomeClick}>
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
                onClick={handleSavedRecipesClick}
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
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">Please sign in to view saved recipes</span>
        </div>
      )}
    </>
  );
};

const SearchPage = () => {
  const { isSignedIn, user } = useUser();
  const [searchQuery, updateSearchQuery] = useState('');
  const [ingredients, setIngredients] = useState([]);
  const [recipeList, updateRecipeList] = useState([]);
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [sortBy, setSortBy] = useState('default');
  const [dietaryPreference, setDietaryPreference] = useState('all');
  const [filters, setFilters] = useState({
    diet: {
      vegetarian: false,
      vegan: false,
      paleo: false,
      'high-fiber': false,
      'high-protein': false,
      'low-carb': false
    },
    health: {
      'low-fat': false,
      'low-sodium': false,
      'low-sugar': false,
      'alcohol-free': false,
      balanced: false,
      immunity: false
    },
    allergies: {
      gluten: false,
      dairy: false,
      eggs: false,
      soy: false,
      wheat: false,
      'tree-nuts': false,
      peanuts: false,
      shellfish: false,
      fish: false
    }
  });
  const [calories, setCalories] = useState({ from: '', to: '' });
  const navigate = useNavigate();
  const location = useLocation();

  // Load saved state from sessionStorage when component mounts
  useEffect(() => {
    const savedState = sessionStorage.getItem('searchState');
    if (savedState) {
      const { 
        savedIngredients, 
        savedRecipeList, 
        savedFilteredRecipes,
        savedFilters,
        savedSortBy,
        savedCalories
      } = JSON.parse(savedState);
      
      setIngredients(savedIngredients);
      updateRecipeList(savedRecipeList);
      setFilteredRecipes(savedFilteredRecipes);
      setFilters(savedFilters);
      setSortBy(savedSortBy);
      setCalories(savedCalories);
    }
  }, []);

  // Save state to sessionStorage whenever it changes
  useEffect(() => {
    if (ingredients.length > 0 || recipeList.length > 0) {
      sessionStorage.setItem('searchState', JSON.stringify({
        savedIngredients: ingredients,
        savedRecipeList: recipeList,
        savedFilteredRecipes: filteredRecipes,
        savedFilters: filters,
        savedSortBy: sortBy,
        savedCalories: calories
      }));
    }
  }, [ingredients, recipeList, filteredRecipes, filters, sortBy, calories]);

  // Add useEffect to clear state on component mount
  useEffect(() => {
    const handleBeforeUnload = () => {
      sessionStorage.removeItem('searchState');
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    if (recipeList.length === 0) return;

    let filtered = [...recipeList];

    // Apply dietary preference filter
    if (dietaryPreference !== 'all') {
      filtered = filtered.filter(recipe => {
        const healthLabels = recipe.recipe.healthLabels.map(label => label.toLowerCase());
        const isVegetarian = healthLabels.some(label => 
          label.includes('vegetarian') || 
          label.includes('lacto-ovo') ||
          label.includes('lacto ovo')
        );
        return dietaryPreference === 'vegetarian' ? isVegetarian : !isVegetarian;
      });
    }

    // Apply diet filters
    const activeDietFilters = Object.entries(filters.diet)
      .filter(([_, value]) => value)
      .map(([key]) => key);
    
    if (activeDietFilters.length > 0) {
      filtered = filtered.filter(recipe => {
        const recipeHealthLabels = recipe.recipe.healthLabels.map(label => label.toLowerCase());
        return activeDietFilters.every(filter => {
          const filterKey = filter.toLowerCase();
          if (filterKey === 'vegetarian') {
            return recipeHealthLabels.some(label => 
              label.includes('vegetarian') || 
              label.includes('lacto-ovo') ||
              label.includes('lacto ovo')
            );
          }
          return recipeHealthLabels.some(label => label.includes(filterKey));
        });
      });
    }

    // Apply health filters
    const activeHealthFilters = Object.entries(filters.health)
      .filter(([_, value]) => value)
      .map(([key]) => key);
    
    if (activeHealthFilters.length > 0) {
      filtered = filtered.filter(recipe => 
        activeHealthFilters.every(filter => 
          recipe.recipe.healthLabels.some(label => 
            label.toLowerCase().includes(filter.toLowerCase())
          )
        )
      );
    }

    // Apply allergy filters
    const activeAllergyFilters = Object.entries(filters.allergies)
      .filter(([_, value]) => value)
      .map(([key]) => key);
    
    if (activeAllergyFilters.length > 0) {
      filtered = filtered.filter(recipe => 
        !activeAllergyFilters.some(filter => 
          recipe.recipe.healthLabels.some(label => 
            label.toLowerCase().includes(filter.toLowerCase())
          )
        )
      );
    }

    // Apply calorie range filter
    if (calories.from || calories.to) {
      filtered = filtered.filter(recipe => {
        const recipeCalories = Math.round(recipe.recipe.calories);
        if (calories.from && recipeCalories < Number(calories.from)) return false;
        if (calories.to && recipeCalories > Number(calories.to)) return false;
        return true;
      });
    }

    // Apply sorting
    switch (sortBy) {
      case 'calories-asc':
        filtered.sort((a, b) => a.recipe.calories - b.recipe.calories);
        break;
      case 'calories-desc':
        filtered.sort((a, b) => b.recipe.calories - a.recipe.calories);
        break;
      case 'ingredients-asc':
        filtered.sort((a, b) => a.recipe.ingredients.length - b.recipe.ingredients.length);
        break;
      case 'ingredients-desc':
        filtered.sort((a, b) => b.recipe.ingredients.length - a.recipe.ingredients.length);
        break;
      case 'alphabetical':
        filtered.sort((a, b) => a.recipe.label.localeCompare(b.recipe.label));
        break;
      default:
        break;
    }

    setFilteredRecipes(filtered);
  }, [recipeList, filters, calories, sortBy, dietaryPreference]);

  const handleRecipeSelect = (recipe) => {
    const recipeId = recipe.recipe.uri.split('#recipe_')[1];
    navigate(`/recipe/${recipeId}`, { state: { recipe } });
  };

  const handleClearSearch = () => {
    setIngredients([]);
    updateRecipeList([]);
    setFilteredRecipes([]);
    setSearchQuery('');
    setFilters({
      diet: Object.keys(filters.diet).reduce((acc, key) => ({ ...acc, [key]: false }), {}),
      health: Object.keys(filters.health).reduce((acc, key) => ({ ...acc, [key]: false }), {}),
      allergies: Object.keys(filters.allergies).reduce((acc, key) => ({ ...acc, [key]: false }), {})
    });
    setCalories({ from: '', to: '' });
    setSortBy('default');
    sessionStorage.removeItem('searchState');
    navigate('/');
  };

  const handleAddIngredient = () => {
    if (searchQuery.trim()) {
      setIngredients(prev => [...prev, searchQuery.trim()]);
      updateSearchQuery('');
    }
  };

  const handleRemoveIngredient = (index) => {
    setIngredients(prev => prev.filter((_, i) => i !== index));
  };

  const handleSearch = async () => {
    if (ingredients.length === 0) return;
    
    setLoading(true);
    const searchString = ingredients.join(',');
    const response = await fetchEdamamResponse(searchString);
    updateRecipeList(response);
    setFilteredRecipes(response);
    setLoading(false);
  };

  const handleFilterChange = (category, type) => {
    setFilters(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [type]: !prev[category][type]
      }
    }));
  };

  const clearFilters = () => {
    setIngredients([]);
    updateRecipeList([]);
    setFilteredRecipes([]);
    setSearchQuery('');
    setFilters({
      diet: Object.keys(filters.diet).reduce((acc, key) => ({ ...acc, [key]: false }), {}),
      health: Object.keys(filters.health).reduce((acc, key) => ({ ...acc, [key]: false }), {}),
      allergies: Object.keys(filters.allergies).reduce((acc, key) => ({ ...acc, [key]: false }), {})
    });
    setCalories({ from: '', to: '' });
    setSortBy('default');
    setDietaryPreference('all');
    sessionStorage.removeItem('searchState');
  };

  const handleRecipeClose = () => {
    setSelectedRecipe(null);
  };

  if (selectedRecipe) {
    return (
      <RecipeDetail
        recipe={selectedRecipe.recipe}
        onClose={handleRecipeClose}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <NavigationBar />
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Search Bar and Ingredients */}
        <div className="mb-8">
          <div className="flex bg-white rounded-lg shadow-sm border border-gray-200 mb-4">
            <input
              type="text"
              placeholder="Add an ingredient..."
              className="flex-1 px-6 py-3 rounded-l-lg focus:outline-none"
              value={searchQuery}
              onChange={(e) => updateSearchQuery(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  if (searchQuery.trim()) {
                    handleAddIngredient();
                  } else if (ingredients.length > 0) {
                    handleSearch();
                  }
                }
              }}
            />
            <button 
              onClick={handleAddIngredient}
              className="px-4 py-3 text-2xl font-bold text-yellow-500 hover:text-yellow-600 transition-colors"
            >
              +
            </button>
            <button 
              onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
              className="px-4 py-3 text-gray-600 hover:text-black transition-colors border-l"
            >
              <i className="fas fa-sliders-h"></i> Filters
            </button>
          </div>

          {/* Ingredient Tags */}
          {ingredients.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {ingredients.map((ingredient, index) => (
                <span 
                  key={index} 
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800"
                >
                  {ingredient}
                  <button
                    type="button"
                    className="ml-2 text-yellow-600 hover:text-yellow-900"
                    onClick={() => handleRemoveIngredient(index)}
                  >
                    ×
                  </button>
                </span>
              ))}
              <button
                onClick={handleSearch}
                className="bg-yellow-500 text-black px-6 py-2 rounded-lg hover:bg-yellow-600 transition-colors text-sm font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                Search Recipes
              </button>
            </div>
          )}

          {/* Filter Menu */}
          {isFilterMenuOpen && (
            <div className="bg-white rounded-lg shadow-lg p-6 mb-4">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">Filters & Sorting</h2>
                <div className="flex space-x-4">
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Clear All
                  </button>
                  <button
                    onClick={() => setIsFilterMenuOpen(false)}
                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>

              {/* Dietary Preference */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-3 text-gray-700">Dietary Preference</h3>
                <div className="grid grid-cols-3 gap-4">
                  <label className="flex items-center space-x-2 p-3 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer border border-gray-200">
                    <input
                      type="radio"
                      name="dietaryPreference"
                      value="all"
                      checked={dietaryPreference === 'all'}
                      onChange={(e) => setDietaryPreference(e.target.value)}
                      className="w-4 h-4 text-yellow-500 border-gray-300 focus:ring-yellow-500"
                    />
                    <span className="text-gray-700">All</span>
                  </label>
                  <label className="flex items-center space-x-2 p-3 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer border border-gray-200">
                    <input
                      type="radio"
                      name="dietaryPreference"
                      value="vegetarian"
                      checked={dietaryPreference === 'vegetarian'}
                      onChange={(e) => setDietaryPreference(e.target.value)}
                      className="w-4 h-4 text-yellow-500 border-gray-300 focus:ring-yellow-500"
                    />
                    <span className="text-gray-700">Vegetarian</span>
                  </label>
                  <label className="flex items-center space-x-2 p-3 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer border border-gray-200">
                    <input
                      type="radio"
                      name="dietaryPreference"
                      value="non-vegetarian"
                      checked={dietaryPreference === 'non-vegetarian'}
                      onChange={(e) => setDietaryPreference(e.target.value)}
                      className="w-4 h-4 text-yellow-500 border-gray-300 focus:ring-yellow-500"
                    />
                    <span className="text-gray-700">Non-Vegetarian</span>
                  </label>
                </div>
              </div>

              {/* Sort Options */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-3 text-gray-700">Sort By</h3>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all"
                >
                  <option value="default">Default (Relevance)</option>
                  <option value="calories-asc">Calories (Low to High)</option>
                  <option value="calories-desc">Calories (High to Low)</option>
                  <option value="ingredients-asc">Ingredients (Least to Most)</option>
                  <option value="ingredients-desc">Ingredients (Most to Least)</option>
                  <option value="alphabetical">Alphabetical (A-Z)</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                {/* Calories */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3 text-gray-700">Calories</h3>
                  <div className="flex gap-3 items-center">
                    <div className="flex-1">
                      <label className="block text-sm text-gray-600 mb-1">From</label>
                      <input
                        type="number"
                        placeholder="Min"
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all"
                        value={calories.from}
                        onChange={(e) => setCalories(prev => ({ ...prev, from: e.target.value }))}
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm text-gray-600 mb-1">To</label>
                      <input
                        type="number"
                        placeholder="Max"
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all"
                        value={calories.to}
                        onChange={(e) => setCalories(prev => ({ ...prev, to: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>

                {/* Diet */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3 text-gray-700">Diet</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(filters.diet).map(([key, value]) => (
                      <label key={key} className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={() => handleFilterChange('diet', key)}
                          className="w-4 h-4 text-yellow-500 border-gray-300 rounded focus:ring-yellow-500"
                        />
                        <span className="text-gray-700 capitalize">{key.replace('-', ' ')}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Allergies */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3 text-gray-700">Allergies</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(filters.allergies).map(([key, value]) => (
                      <label key={key} className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={() => handleFilterChange('allergies', key)}
                          className="w-4 h-4 text-yellow-500 border-gray-300 rounded focus:ring-yellow-500"
                        />
                        <span className="text-gray-700 capitalize">{key.replace('-', ' ')}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Apply Filters Button */}
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    handleSearch();
                    setIsFilterMenuOpen(false);
                  }}
                  className="bg-yellow-500 text-black px-6 py-3 rounded-lg hover:bg-yellow-600 transition-colors font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Recipe Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-yellow-500 border-t-transparent"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredRecipes?.length ? (
              filteredRecipes.map((recipe, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => {
                    setSelectedRecipe(recipe);
                    handleRecipeSelect(recipe);
                  }}
                >
                  <div className="relative">
                    <img
                      src={recipe.recipe.image}
                      alt={recipe.recipe.label}
                      className="w-full h-48 object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold mb-2">{recipe.recipe.label}</h3>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>{Math.round(recipe.recipe.calories)} CALORIES</span>
                      <span>{recipe.recipe.ingredients.length} INGREDIENTS</span>
                    </div>
                    <div className="mt-2 text-sm text-gray-500">
                      {recipe.recipe.source}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center text-gray-500">
                {ingredients.length > 0 ? 
                  'No recipes found. Try different ingredients!' :
                  'Add ingredients and click search to find recipes!'}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

const RecipeDetailPage = () => {
  const { recipeId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const recipe = location.state?.recipe;

  if (!recipe) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4 text-red-500">Recipe not found</h2>
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

  const handleClose = () => {
    navigate('/');
  };

  return <RecipeDetail recipe={recipe.recipe} onClose={handleClose} />;
};

const AppComponent = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SearchPage />} />
        <Route path="/recipe/:recipeId" element={<RecipeDetailPage />} />
        <Route path="/saved" element={<SavedRecipes />} />
      </Routes>
    </Router>
  );
};

export default AppComponent;
