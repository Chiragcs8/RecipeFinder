import React, { useState } from 'react';

const RecipeComponent = ({ recipe }) => {
  const [showModal, setShowModal] = useState(false);

  const { label, image, ingredients, url } = recipe;

  return (
    <div className="bg-gray-200 p-4 rounded-lg shadow-lg flex flex-col items-center">
      <img src={image} alt={label} className="w-full h-48 object-cover rounded-lg" />
      <h2 className="text-lg font-bold mt-2">{label}</h2>
      <button
        onClick={() => setShowModal(true)}
        className="mt-2 bg-green-500 text-white px-4 py-2 rounded"
      >
        Ingredients
      </button>
      <a
        href={url}
        className="mt-2 bg-blue-500 text-white px-4 py-2 rounded"
        target="_self"
        rel="noopener noreferrer"
      >
        See Complete Recipe
      </a>
      
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 md:w-1/3">
            <h3 className="text-md font-bold mb-2">Ingredients for {label}</h3>
            <ul className="space-y-2">
              {ingredients.map((ingredient, index) => (
                <li key={index} className="flex justify-between py-1 border-b">
                  <span>{ingredient.text}</span>
                  <span>{ingredient.weight}g</span>
                </li>
              ))}
            </ul>
            <button
              onClick={() => setShowModal(false)}
              className="mt-4 bg-red-500 text-white px-4 py-2 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecipeComponent;
