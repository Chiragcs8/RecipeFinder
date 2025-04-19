import React, { useState, useEffect } from "react";

const RecipeRating = ({ recipeId }) => {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const savedReviews = JSON.parse(localStorage.getItem(`reviews-${recipeId}`)) || [];
    setReviews(savedReviews);
  }, [recipeId]);

  const submitReview = () => {
    if (rating > 0 && review.trim() !== "") {
      const newReview = { rating, review };
      const updatedReviews = [...reviews, newReview];
      setReviews(updatedReviews);
      localStorage.setItem(`reviews-${recipeId}`, JSON.stringify(updatedReviews));
      setRating(0);
      setReview("");
    }
  };

  const removeReview = (index) => {
    const updatedReviews = reviews.filter((_, i) => i !== index);
    setReviews(updatedReviews);
    localStorage.setItem(`reviews-${recipeId}`, JSON.stringify(updatedReviews));
  };

  return (
    <div className="mt-6 p-4 border rounded-lg shadow-md max-w-md mx-auto">
      <h2 className="text-lg font-bold mb-2">Rate this Recipe</h2>
      <select
        className="border p-2 w-full rounded text-black"
        value={rating}
        onChange={(e) => setRating(Number(e.target.value))}
      >
        <option value="0">Select Rating</option>
        {[1, 2, 3, 4, 5].map((num) => (
          <option key={num} value={num}>{num} Stars</option>
        ))}
      </select>
      <textarea
        className="border p-2 w-full rounded mt-2 text-black"
        placeholder="Write a review..."
        value={review}
        onChange={(e) => setReview(e.target.value)}
      />
      <button
        className="bg-blue-500 text-white p-2 rounded mt-2 w-full"
        onClick={submitReview}
      >
        Submit Review
      </button>
      <div className="mt-4">
        <h3 className="font-bold">Reviews:</h3>
        {reviews.map((rev, index) => (
          <div key={index} className="flex justify-between items-center text-gray-700">
            <p>⭐ {rev.rating} - {rev.review}</p>
            <button className="text-red-500" onClick={() => removeReview(index)}>❌</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecipeRating;
