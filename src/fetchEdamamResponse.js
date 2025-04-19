import Axios from 'axios';

const APP_ID = String(import.meta.env.VITE_API_ID); 
const APP_KEY = String(import.meta.env.VITE_API_KEY);
export const fetchEdamamResponse = async (searchString) => {
  try {
    const response = await Axios.get(
      `https://api.edamam.com/api/recipes/v2?type=public&q=${searchString}&app_id=${APP_ID}&app_key=${APP_KEY}&to=100`
    );
    return response.data.hits;
  } catch (error) {
    console.error('Error fetching the recipe data: ', error);
    return [];
  }
};
