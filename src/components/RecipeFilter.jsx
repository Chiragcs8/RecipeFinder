import React, { useState } from "react";

const RecipeFilter = ({ categories = [], onFilter }) => {  // Default value added
  const [selectedCategory, setSelectedCategory] = useState("All");

  const handleFilterChange = (event) => {
    setSelectedCategory(event.target.value);
    onFilter(event.target.value);
  };

  return (
    <div className="p-4">
      <label className="block mb-2 font-bold">Filter by Category:</label>
      <select
        className="border p-2 rounded w-full"
        value={selectedCategory}
        onChange={handleFilterChange}
      >
        <option value="All">All</option>
        {Array.isArray(categories) && categories.map((category) => (  // Safe check added
          <option key={category} value={category}>{category}</option>
        ))}
      </select>
    </div>
  );
};

export default RecipeFilter;
