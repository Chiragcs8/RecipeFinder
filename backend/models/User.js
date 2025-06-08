import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true
  },
  recipes: [{
    recipeId: String,
    label: String,
    image: String,
    source: String,
    url: String,
    calories: Number,
    totalTime: Number,
    ingredients: Array,
    dietLabels: Array,
    healthLabels: Array,
    savedAt: {
      type: Date,
      default: Date.now
    }
  }]
});

const User = mongoose.model('User', userSchema);

export default User; 