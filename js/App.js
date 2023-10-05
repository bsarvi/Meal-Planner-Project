import { addToast } from "./Toast.js";

/**------------------------------- BMR model opening and closing code --------------------------------- */

const openModalButtons = document.querySelectorAll("#openModal"); //buttons to open bmr form model
const closeModalButton = document.getElementById("closeModal"); //button to close bmr form model
const modal = document.getElementById("modal"); //HTML elemnt for the Bmr form model

// handels the the opening of model
function handelOpenModel() {
  modal.style.animation = "slide-in 0.3s ease-in-out forwards";
  modal.style.display = "block";
}

//handels the closing of model
function handelCloseModel() {
  modal.style.animation = "slide-out 0.3s ease-in-out forwards";
  setTimeout(() => {
    modal.style.display = "none";
  }, 300);
}

//add eventlisteners to open model buttons
openModalButtons.forEach((btn) =>
  btn.addEventListener("click", handelOpenModel)
);
// add eventlisteners to close model button
closeModalButton.addEventListener("click", handelCloseModel);

/**------------------------------- BMR form handel code --------------------------------- */

const bmrForm = document.getElementById("bmr-form"); //html elemnt of the form
const weightElement = document.getElementById("weight"); // weight input
const heightElement = document.getElementById("height"); // height input
const ageElement = document.getElementById("age"); //age input
const genderElement = document.getElementById("gender"); // gender select
const activityElement = document.getElementById("activity"); // activity level select
const onbordingScreenElement = document.getElementById("onboard"); // onboaring screen elemnt
const mealsScreenElement = document.getElementById("meals"); // meals screen element
const mealsCardWrapperElement = document.getElementById("meals-card-wrapper"); // meals card wrapper elemnt
let getRecipeButtonsElements; //for get recipeBuuton

// Handels any error if there and toast are added
const handelErrorsIfAny = (obj) => {
  const errors = [];
  for (const key in obj) {
    if (obj[key] === "") {
      const err = { msg: `${key} is Required` };
      errors.push(err);
    }
  }
  if (errors.length <= 0) return false;
  console.log(errors.length);

  if (errors.length > 2) {
    addToast("error", "Please Provide all Feilds");
  } else {
    errors.forEach((err) => addToast("error", err.msg));
  }
  return true;
};

//returns the meals object as array
const getMealsAsArray = (mealPlan) => {
  const mealArr = [];

  for (const mealType in mealPlan) {
    if (mealType === "min" || mealType === "max") continue;
    const mealobject = {
      id: mealPlan[mealType].id,
      meal: mealType,
      title: mealPlan[mealType].title,
      readyInMinutes: mealPlan[mealType].readyInMinutes,
      image: mealPlan[mealType].image,
    };
    mealArr.push(mealobject);
  }
  return mealArr;
};

// meals plan based on calories provide in array form or if any error error will be thrown back to the caller
const getMealPlan = async (calories) => {
  try {
    const response = await fetch(
      "https://content.newtonschool.co/v1/pr/64995a40e889f331d43f70ae/categories"
    );

    if (!response.ok) {
      // Handle HTTP errors
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();

    const mealPlan = data.find(
      (meal) => calories >= meal.min && calories < meal.max
    );

    if (!mealPlan) {
      // Handle the case when no meal plan is found for the given calories
      throw new Error("No meal plan found for the provided calories");
    }

    return getMealsAsArray(mealPlan);
  } catch (error) {
    // Handle any caught errors here
    console.error("An error occurred:", error);
    throw error; // Rethrow the error to propagate it to the caller if needed
  }
};

// calculate calores and return it based on provide data inputs
const calculateCalories = (data) => {
  const { weight, age, height, activityLevel, gender } = data;
  let bmr;
  if (gender === "male") {
    bmr =
      66.47 +
      13.75 * Number(weight) +
      5.003 * Number(height) -
      6.755 * Number(age);
  } else if (gender === "female") {
    bmr = 655.1 + 9.563 * weight + 1.85 * height - 4.676 * age;
  }
  let calories;
  if (activityLevel === "light") {
    calories = bmr * 1.375;
  } else if (activityLevel === "moderate") {
    calories = bmr * 1.55;
  } else if (activityLevel === "active") {
    calories = bmr * 1.725;
  }
  return calories;
};

// Resets all input after successful submission
const resetInputs = () => {
  weightElement.value = "";
  heightElement.value = "";
  ageElement.value = "";
  genderElement.value = "";
  activityElement.value = "";
};

//renders the meal cards in html
const renderMealCards = (meals, calories) => {
  calories = Math.round(calories);
  const mealsComponents = meals.map(
    (meal) => `
    <article class="flex flex-col text-center justify-center w-full sm:w-auto">
    <h2 class="uppercase text-blue-500 font-black">${meal.meal}</h2>
    <div
      class=" flex-1 w-full sm:w-72 p-2 pb-4 border border-blue-500 flex flex-col gap-2 hover:scale-105 transition-all duration-300 my-4 rounded-lg"
    >
      <div class="relative h-56 w-full overflow-hidden rounded-lg">
        <img
          class="w-full h-full object-cover"
          src="${meal.image}"
        />
        <span
          class="absolute top-1 right-1 px-2 py-1 bg-blue-50 text-blue-900 rounded-full"
          >Ready in ${meal.readyInMinutes}min</span
        >
      </div>
      <h3 class="text-xl font-semibold text-blue-800">${meal.title}</h3>
      <p class="text-lg text-blue-700">Calories - ${calories}</p>
      <button
      id='get-recipe' data-id='${meal.id}' 
        class="btn bg-blue-900 w-full hover:bg-blue-950 active:scale-95 transition-all duration-300"
      >
        Get Recipe
      </button>
    </div>
  </article>
    `
  );
  mealsCardWrapperElement.innerHTML = mealsComponents.join("");

  onbordingScreenElement.style.display = "none";
  mealsScreenElement.style.display = "block";
};

//handels bmr form sumit and drives the whole process from collecting inputs to rendring meals in html
const handelBmrFormSubmit = async (e) => {
  e.preventDefault();
  const data = {
    weight: weightElement.value,
    height: heightElement.value,
    age: ageElement.value,
    gender: genderElement.value,
    activityLevel: activityElement.value,
  };
  const iserror = handelErrorsIfAny(data);
  if (iserror) return;

  const calories = calculateCalories(data);

  try {
    const meals = await getMealPlan(calories);
    handelCloseModel();
    resetInputs();
    renderMealCards(meals, calories);
    addToast("success", "fetched meal plans");
    document.querySelectorAll("#get-recipe").forEach((btn) =>
      btn.addEventListener("click", (e) => {
        const id = e.target.getAttribute("data-id");
        handleGetRecipe(id);
      })
    );
  } catch (error) {
    addToast("error", error.message);
  }
};

bmrForm.addEventListener("submit", handelBmrFormSubmit);

/**------------------------------- handel get Recipe code --------------------------------- */

const ingredientsListWrapper = document.getElementById("ingredients");
const stepsListWrapper = document.getElementById("steps");
const equipmentsListWrapper = document.getElementById("equipments");
const tabWrapperContainer = document.getElementById("tabs-wrapper");
const tabSelectElemnt = document.getElementById("tabs");

// gets all recipes as array from local storage
const getAllRecipeFromLocalStorage = () => {
  const storedArray = JSON.parse(localStorage.getItem("recipes"));
  if (storedArray === null) return [];
  return storedArray;
};

// given id, gets recipes as object from local storage
const getRecipeFromLocalStorage = (id) => {
  const storedArray = getAllRecipeFromLocalStorage();
  if (storedArray.length === 0) return { status: false };
  const recipe = storedArray.find((obj) => obj.id === id);
  if (recipe === undefined) return { status: false };
  recipe.status = true;
  return recipe;
};

const updateRecipeInLoaclStorage = (obj) => {
  const storedArray = getAllRecipeFromLocalStorage();
  storedArray.push(obj);
  localStorage.setItem("recipes", JSON.stringify(storedArray));
};

// gets recipe from api
const getRecipeFromApi = async (id) => {
  try {
    const response = await fetch(
      `https://content.newtonschool.co/v1/pr/64996337e889f331d43f70ba/recipes/${id}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("An error occurred:", error);
    throw error;
  }
};

//gets data from localstoreage if present or gets from api endpoint
const getRecipe = async (id) => {
  const fromLS = getRecipeFromLocalStorage(id);
  if (fromLS.status) return fromLS;
  try {
    const recipe = await getRecipeFromApi(id);
    updateRecipeInLoaclStorage(recipe);
    return recipe;
  } catch (error) {
    throw error;
  }
};

//  gets ingredients as li elements joined together as string
const getIngredientsListElements = (ingredients) => {
  return ingredients
    .map((ingredient) => {
      return `<li>
          <i class="fa-regular fa-circle-dot text-slate-600 text-sm"></i
          ><span>${ingredient}</span>
        </li>`;
    })
    .join("");
};

//  gets steps as li elements joined together as string
const getStepsListElements = (steps) => {
  return steps
    .map((step) => {
      return `<li>
      <i class="fa-solid fa-shoe-prints text-slate-600 text-sm"></i>
      <span>${step}</span>
    </li>`;
    })
    .join("");
};

//Renders the repices in html
const renderRecipe = (recipe) => {
  const { ingredients, steps } = recipe;
  const ingredientsArr = ingredients.split(",").map((str) => str.trim());
  const stepsArr = steps.split(".").map((str) => str.trim());
  ingredientsListWrapper.innerHTML = getIngredientsListElements(ingredientsArr);
  stepsListWrapper.innerHTML = getStepsListElements(stepsArr);
  tabWrapperContainer.style.display = "flex";
};

async function handleGetRecipe(id) {
  try {
    const recipe = await getRecipe(id);
    renderRecipe(recipe);
    tabSelectElemnt.value = "ingredients";
    ingredientsListWrapper.style.display = "flex";
    stepsListWrapper.style.display = "none";
    equipmentsListWrapper.style.display = "none";
    tabWrapperContainer.scrollIntoView({ behavior: "smooth" });
  } catch (error) {
    addToast("error", error.message);
  }
}

const handelChangeTab = (e) => {
  const selectedTab = e.target.value;
  if (selectedTab === "ingredients") {
    ingredientsListWrapper.style.display = "flex";
    stepsListWrapper.style.display = "none";
    equipmentsListWrapper.style.display = "none";
  } else if (selectedTab === "steps") {
    ingredientsListWrapper.style.display = "none";
    stepsListWrapper.style.display = "flex";
    equipmentsListWrapper.style.display = "none";
  } else if (selectedTab === "equipments") {
    ingredientsListWrapper.style.display = "none";
    stepsListWrapper.style.display = "none";
    equipmentsListWrapper.style.display = "flex";
  }
};

tabSelectElemnt.addEventListener("change", handelChangeTab);
