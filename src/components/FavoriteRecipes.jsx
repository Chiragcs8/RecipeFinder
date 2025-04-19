import React, { useState, useEffect } from "react";

const FavoriteRecipes = () => {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const savedFavorites = JSON.parse(localStorage.getItem("favoriteRecipes")) || [];
    setFavorites(savedFavorites);
  }, []);

  const removeFavorite = (index) => {
    const updatedFavorites = favorites.filter((_, i) => i !== index);
    setFavorites(updatedFavorites);
    localStorage.setItem("favoriteRecipes", JSON.stringify(updatedFavorites));
  };

  return (
    <div className="p-4 border rounded-lg shadow-md max-w-md mx-auto mt-4">
      <h2 className="text-lg font-bold mb-2">Favorite Recipes</h2>
      {favorites.length === 0 ? <p>No favorites yet.</p> : (
        <ul>
          {favorites.map((recipe, index) => (
            <li key={index} className="flex justify-between items-center p-2 border-b">
              {recipe}
              <button className="text-red-500" onClick={() => removeFavorite(index)}>❌</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FavoriteRecipes;