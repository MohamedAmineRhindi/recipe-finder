const options = {
    method: 'GET',
    headers: {
        'X-RapidAPI-Host': 'spoonacular-recipe-food-nutrition-v1.p.rapidapi.com',
        'X-RapidAPI-Key': 'be0306e9afmsh512f0795d035117p17c4ebjsne32819cd4a11'
    }
}
const searchForm = document.getElementById("search")
const searchResults = document.getElementById("search-results")
const selectedRecipe = document.getElementById("selected-recipe")
let resultsId = []
let detailedRecipesArray = []

async function getRecipes(keyword) {
    const url = `https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/recipes/search?query=${keyword}`
    const res = await fetch(url, options)
    const recipes = await res.json()
    return recipes
}

async function getRecipeById() {
    const promises = resultsId.map(id => {
        const url = `https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/recipes/${id}/information`
        return fetch(url, options)
    })
    const responses = await Promise.all(promises)
    const data = await responses.map(res => res.json())
    const recipes = await Promise.all(data)
    return recipes
}

searchForm.addEventListener("submit", event => {
    event.preventDefault()
    selectedRecipe.style.display = "none"
    const keyword = document.getElementById("search-bar").value

    getRecipes(keyword).then(recipes => {
        resultsId = recipes.results.map(recipe => recipe.id)
        searchResults.innerHTML = getRecipeHtml(recipes)
        getRecipeById()
            .then(data => {
                detailedRecipesArray = data
                const myRecipes = Array.from(document.getElementsByClassName("recipe"))
                myRecipes.forEach((recipe, index) => {
                    recipe.addEventListener("click", event => {
                        console.log(detailedRecipesArray[index])
                        selectedRecipe.innerHTML = getDetailedRecipeHtml(detailedRecipesArray[index])
                        selectedRecipe.style.display = "block"
                        document.body.scrollTop = document.documentElement.scrollTop = 0;
                    })
                })
            })
    })
})

function getRecipeHtml(recipes) {
    const baseURL = recipes.baseUri
    console.log(baseURL)
    const recepesHtml = recipes.results.map(recipe => {
        const { title, servings, readyInMinutes, sourceUrl, image } = recipe
        return `
            <div class="recipe">
                <img src="${baseURL}${image}" alt="image of ${title}" class="recipe-img">
                <p class="recipe-servings">Number of serving: <strong>${servings}</strong></p>
                <h2 class="recipe-title">${title}</h2>
                <p class="recipe-TTM">Time to make: <strong>${readyInMinutes} min</strong></p>
            </div>
        `
    }).join("")
    return recepesHtml
}
//<p>${amount} ${unitShort ? unitShort : name}</p>
function getDetailedRecipeHtml(recipe) {
    const { title, summary,  extendedIngredients, image, servings, cookingMinutes, preparationMinutes } = recipe
    const steps = recipe.analyzedInstructions[0].steps
    const stepsHtml = steps.map(step=>{
        return `
            <li class="instructions">${step.step}</li>
        `
    }).join("")
    const ingredientsHtml = extendedIngredients.map(ingredient => {
        const { amount, unitShort } = ingredient.measures.metric
        const { name } = ingredient
        return `
            <div class="ingredient">
                <p>${ingredient.original}</p>
                <p>${unitShort === "serving" ? "" : unitShort ? amount + " " + unitShort : amount + " " + name}</p>
            </div>
        `
    }).join("")
    return `
        <img src="${image}" alt="image of ${title}" class="recipe-img">
        <p class="recipe-servings">Number of serving: <strong>${servings}</strong></p>
        <h2 class="recipe-title">${title}</h2>
        <p class="summary">${summary}</p>
        <p class="recipe-TTM">Preperation time: <strong>${preparationMinutes} min</strong></p>
        <p class="recipe-TTM">Cooking time: <strong>${cookingMinutes} min</strong></p>
        <h2 class="recipe-title">Ingredients</h2>
        <div class="ingredients">${ingredientsHtml}</div>
        <h2 class="recipe-title">Instructions</h2>
        <ol>${stepsHtml}</ol>
    `
}