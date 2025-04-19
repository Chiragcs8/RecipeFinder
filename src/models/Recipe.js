import mongoose from 'mongoose';

const RecipeSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  recipeId: {
    type: String,
    required: true
  },
  label: {
    type: String,
    required: true
  },
  image: String,
  source: String,
  url: String,
  calories: Number,
  totalTime: Number,
  ingredients: [{
    text: String,
    weight: Number,
    foodCategory: String
  }],
  dietLabels: [String],
  healthLabels: [String],
  savedAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index to prevent duplicate saves
RecipeSchema.index({ userId: 1, recipeId: 1 }, { unique: true });

export default mongoose.models.Recipe || mongoose.model('Recipe', RecipeSchema); 