import * as model from './model.js'
import 'core-js/stable'
import 'regenerator-runtime/runtime'
import recipeview from './views/recipeviews.js'
import searchView from './views/searchViews.js'
import resultsview from './views/resultsview.js'
import paginationview from './views/paginationview.js'
import bookmarksview from './views/bookmarksview.js'
import addrecipeview from './views/addrecipeview.js'
import { MODAL_CLOSE_M_SEC }  from './config.js'
// import { update } from 'lodash-es'
// import { search } from 'core-js/fn/symbol'

const recipeContainer = document.querySelector('.recipe');

///////////////////////////////////////

const controlRecipes = async function(){
  try{
    const id = window.location.hash.slice(1)
    if(!id) return
    recipeview.renderSpinner()
    await model.loadRecipe(id)
    resultsview.update(model.getSearchResultsPage())
    recipeview.render(model.state.recipe);
    bookmarksview.update(model.state.bookmarks)
  }catch(err){
    // recipeview.renderError()
    console.error(err);
  }
}

const controlSearchResults = async function(){
  try{
    resultsview.renderSpinner()
    const query = searchView.getQuery()
    if (!query) return 
    await model.loadSearchResults(query)
    resultsview.render(model.getSearchResultsPage())
    paginationview.render((model.state.search))
  }catch(err){
    console.log(err);
  }
}

const controlPagination = function(goToPage){
  model.state.search.page = goToPage
  paginationview.render(model.state.search) 
  resultsview.render(model.getSearchResultsPage(model.state.search.page))
}

const controlServings = function(servings){
  model.updateServings(servings)
  // recipeview.render(model.state.recipe)
  recipeview.update(model.state.recipe)
}

const controlAddBookmark = function(){
  if (!model.state.recipe.bookmarked) {model.addBookmark(model.state.recipe)}    else {model.deleteBookmark(model.state.recipe.id)
  }
  bookmarksview.render(model.state.bookmarks)
  recipeview.update(model.state.recipe)
}

const controlBookmarkRender = function(){
  bookmarksview.render(model.state.bookmarks)
}

const controlAddRecipes = async function(newRecipe){
  try{
    addrecipeview.renderSpinner()
    await model.uploadRecipe(newRecipe)
    recipeview.render(model.state.recipe)
    addrecipeview.renderMessage()
    bookmarksview.render(model.state.bookmarks)
    window.history.pushState(null,'',`#${model.state.recipe.id}`)
    setTimeout(()=>addrecipeview.toggleWindow(),MODAL_CLOSE_M_SEC)
  }catch(err){
    addrecipeview.renderError(err.message)
  }
}


const init = function(){
  bookmarksview.addHandlerRender(controlBookmarkRender)
  recipeview.addHandlerRender(controlRecipes)
  recipeview.addHandlerServings(controlServings)
  recipeview.addHandlerBookmark(controlAddBookmark)
  searchView.addHandlerSearch(controlSearchResults)
  paginationview.addHandlerClick(controlPagination)
  addrecipeview.addHandlerUpload(controlAddRecipes)
}
init()