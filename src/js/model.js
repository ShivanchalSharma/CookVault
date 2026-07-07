import {async} from 'regenerator-runtime'
import {API_URL, resultsPerPage, KEY} from './config.js'
import { getJSON, sendJSON } from './helpers.js'

export const state = {
    recipe: {},
    search: {
    query: '',
    results: [],
    page: 1,
    ResultsPerPage: resultsPerPage,
    },
    bookmarks: []
}

const createRecipeObject = function(data){
    const {recipe} = data.data
    return {
    id: recipe.id,
    title: recipe.title,
    publisher: recipe.publisher,
    sourceURL: recipe.source_url,
    image: recipe.image_url,
    servings: recipe.servings,
    cookingTime: recipe.cooking_time,
    ingredients: recipe.ingredients,
    ...(recipe.key && {key: recipe.key}),
  }
}

export const loadRecipe = async function(id){
    try{
    const data = await getJSON(`${API_URL}${id}?key=${KEY}`)
    state.recipe = createRecipeObject(data)
  if (state.bookmarks.some(bookmark=>bookmark.id===id))
    state.recipe.bookmarked = true
else state.recipe.bookmarked = false    
}catch(err){
    console.error(`${err.message} 🔴`)
    throw err
}
}

export const loadSearchResults = async function(query){
    try{
        state.search.query = query
        const data = await getJSON(`${API_URL}?search=${query}&key=${KEY}`)
        state.search.results = data.data.recipes.map(recipe=>{
            return {
            id: recipe.id,
            title: recipe.title,
            publisher: recipe.publisher,
            image: recipe.image_url,
            ...(recipe.key && {key: recipe.key}),
        }})
        state.search.page = 1
    } catch(err){
        console.error(`${err.message} 🔴`)
        throw err
    }
}

export const getSearchResultsPage = function(page = state.search.page){
    state.search.page = page
    const start = (page-1)*state.search.ResultsPerPage
    const end = page * state.search.ResultsPerPage 
    return state.search.results.slice(start,end)
}

export const updateServings = function(num){
   state.recipe.ingredients.forEach(ing=>{
    ing.quantity = (ing.quantity * num)/state.recipe.servings 
   })
   console.log(num);
   state.recipe.servings = num
}

const persistBookmarks = function(){
    localStorage.setItem('bookmarks',JSON.stringify(state.bookmarks))
}

export const addBookmark = function(recipe){
    state.bookmarks.push(recipe)
    if(recipe.id === state.recipe.id) state.recipe.bookmarked = true
    persistBookmarks()
}

export const deleteBookmark = function(id){
    const index = state.bookmarks.findIndex(el=>el.id === id)
    state.bookmarks.splice(index,1)
    if(id === state.recipe.id) state.recipe.bookmarked = false
    persistBookmarks()
}


export const uploadRecipe = async function(newRecipe){
    try{
        const ingredients = Object.entries(newRecipe).filter(entry=>entry[0].startsWith('ingredient') && entry[1]!== '').map(ing=>{
            const [numQty,unit,description] = ing[1].split(',').map(el=>el.trim())
            const quantity = +numQty
            if(!description){
                throw new Error('Wrong ingredient format! Please try again with the correct format.')
            }
            return {quantity,unit,description}
        })
        
    const recipe = {
        title: newRecipe.title,
        source_url: newRecipe.sourceUrl,
        image_url: newRecipe.image,
        publisher: newRecipe.publisher,
        cooking_time: +newRecipe.cookingTime,
        servings: +newRecipe.servings,
        ingredients,
    }
        const data = await sendJSON(`${API_URL}?key=${KEY}`, recipe)
        state.recipe = createRecipeObject(data)
        addBookmark(state.recipe)
    }catch(err){
        throw err
    }
}



const init = function(){
    const storage = localStorage.getItem('bookmarks')
    if (storage) state.bookmarks = JSON.parse(storage)
}
init()
