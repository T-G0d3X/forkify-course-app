import { async } from 'regenerator-runtime';
import { API_URL, RES_PER_PAGE, KEY } from './config';
import { AJAX } from './helpers';

// state contains all the data that we need in order to build the application
export const state = {
  recipe: {},
  search: {
    query: '',
    results: [],
    page: 1,
    resultsPerPage: `${RES_PER_PAGE}`,
  },
  bookmarks: [],
};

const createRecipeObject = function (data) {
  const { recipe } = data.data;
  //4. creating new recipe object based on one above
  return {
    id: recipe.id,
    title: recipe.title,
    publisher: recipe.publisher,
    sourceUrl: recipe.source_url,
    image: recipe.image_url,
    servings: recipe.servings,
    cookingTime: recipe.cooking_time,
    ingredients: recipe.ingredients,
    // if recipe.key is falsy value nothing happens, if it is something then right side is returned and spread
    ...(recipe.key && { key: recipe.key }),
  };
};

// this function does not return anything, it only changes our state object which contains recipe and which controller will grab into and take the recipe
// work because there is live connection between exports and imports
export const loadRecipe = async function (id) {
  try {
    const data = await AJAX(`${API_URL}${id}`);

    state.recipe = createRecipeObject(data);

    // when we get all the data and store it in state we check if there is already a recipe with same id in bookmarks state, and if it is we will mark current recipe as bookmarked set to true
    if (state.bookmarks.some(bookmark => bookmark.id === id))
      state.recipe.bookmarked = true;
    else state.recipe.bookmarked = false;
  } catch (err) {
    // we throw error again so we can use it in controller
    throw err;
  }
};

// call this func in controller
export const loadSearchResults = async function (query) {
  try {
    state.search.query = query;

    const data = await AJAX(`${API_URL}?search=${query}`);

    // creating new array where the property names are different with map() and saving it to state object above
    state.search.results = data.data.recipes.map(rec => {
      return {
        id: rec.id,
        title: rec.title,
        publisher: rec.publisher,
        image: rec.image_url,
      };
    });
    // when we type in the search different meal we are on the page we were before, reset it here
    state.search.page = 1;
  } catch (err) {
    throw err;
  }
};

// create a function that will take a page that we want to render and which returns results that we want to render for that page
export const getSearchResultsPage = function (page = state.search.page) {
  state.search.page = page;

  // take the page and multiply by amount of results we want per page
  const start = (page - 1) * state.search.resultsPerPage; // 0
  const end = page * state.search.resultsPerPage; // 9

  return state.search.results.slice(start, end);
};

export const updateServings = function (newServings) {
  state.recipe.ingredients.forEach(ing => {
    ing.quantity = (ing.quantity * newServings) / state.recipe.servings;
  });

  state.recipe.servings = newServings;
};

// to save bookmarks in localStorage
const persistBookmarks = function () {
  localStorage.setItem('bookmarks', JSON.stringify(state.bookmarks));
};

// function recieve recepie and set it as a bookmark(pushing it into array bookmarks)
export const addBookmark = function (recipe) {
  // Add bookmark
  state.bookmarks.push(recipe);

  // mark current recipe as bookmarked
  if (recipe.id === state.recipe.id) state.recipe.bookmarked = true;

  persistBookmarks();
};

export const deleteBookmark = function (id) {
  const index = state.bookmarks.findIndex(el => el.id === id);
  state.bookmarks.splice(index, 1);

  // mark current recipe as NOT bookmarked
  if (id === state.recipe.id) state.recipe.bookmarked = false;

  persistBookmarks();
};

const init = function () {
  const storage = localStorage.getItem('bookmarks');
  if (storage) state.bookmarks = JSON.parse(storage);
};

init();

const clearBookmarks = function () {
  localStorage.clear('bookmarks');
};
// clearBookmarks();

// take raw input data and transform it into same format that we get from the API
export const uploadRecipe = async function (newRecipe) {
  try {
    // converting into object
    const ingredients = Object.entries(newRecipe)
      .filter(entry => entry[0].startsWith('ingredient') && entry[1] !== '')
      .map(ing => {
        const ingArr = ing[1].replaceAll(' ', '').split(',');
        if (ingArr.length !== 3)
          throw new Error(
            'Wrong ingredient format! Please use the correct format'
          );

        const [quantity, unit, description] = ingArr;

        return { quantity, unit, description };
      });

    // creating object that is ready to be uploaded
    const recipe = {
      title: newRecipe.title,
      source_url: newRecipe.sourceUrl,
      image_url: newRecipe.image,
      publisher: newRecipe.publisher,
      cooking_time: +newRecipe.cookingTime,
      servings: +newRecipe.servings,
      ingredients,
    };
    //  2 parameters url and the data
    const data = await AJAX(`${API_URL}?key=${KEY}`, recipe);

    state.recipe = createRecipeObject(data);
    addBookmark(state.recipe);
  } catch (err) {
    throw err;
  }
};
