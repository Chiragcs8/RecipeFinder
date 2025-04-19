import React, { useState, useEffect } from "react";

const ShoppingList = () => {
  const [item, setItem] = useState("");
  const [list, setList] = useState([]);

  useEffect(() => {
    const savedList = JSON.parse(localStorage.getItem("shoppingList")) || [];
    setList(savedList);
  }, []);

  const addItem = () => {
    if (item.trim() !== "") {
      const updatedList = [...list, item];
      setList(updatedList);
      localStorage.setItem("shoppingList", JSON.stringify(updatedList));
      setItem("");
    }
  };

  const removeItem = (index) => {
    const updatedList = list.filter((_, i) => i !== index);
    setList(updatedList);
    localStorage.setItem("shoppingList", JSON.stringify(updatedList));
  };

  const clearList = () => {
    setList([]);
    localStorage.removeItem("shoppingList");
  };

  return (
    <div className="p-4 border rounded-lg shadow-md max-w-md mx-auto mt-4">
      <h2 className="text-lg font-bold mb-2">Shopping List</h2>
      <input
        type="text"
        className="border p-2 w-full rounded text-black"
        placeholder="Add an ingredient"
        value={item}
        onChange={(e) => setItem(e.target.value)}
      />
      <button
        className="bg-green-500 text-white p-2 rounded mt-2 w-full"
        onClick={addItem}
      >
        Add Item
      </button>
      <ul className="mt-4">
        {list.map((itm, index) => (
          <li key={index} className="text-gray-700 flex justify-between">
            {itm} 
            <button
              className="text-red-500"
              onClick={() => removeItem(index)}
            >
              ❌
            </button>
          </li>
        ))}
      </ul>
      {list.length > 0 && (
        <button
          className="bg-red-500 text-white p-2 rounded mt-2 w-full"
          onClick={clearList}
        >
          Clear List
        </button>
      )}
    </div>
  );
};

export default ShoppingList;
