////////////////////////////////////////////////////////////////////////////////////
// Variable initialization
////////////////////////////////////////////////////////////////////////////////////

// DOM elements
const buttonAddTask = document.getElementById("addNewTask")
const allTaskDiv = document.getElementById("allTaskDiv")
const addingTaskPopup = document.getElementById("addingTaskPopup")
const overlay = document.getElementById("overlay")
const divStatNbTasks = document.getElementById("statNbTasks")
const divStatNbLateTask = document.getElementById("statNbLateTask")
const divStatNbTasksCompleted = document.getElementById("statNbTasksCompleted")
const buttonSearchedTask = document.getElementById("searchButton")
const validateAllTaskButton = document.getElementById("validateAllTasks")
const resetAllTaskButton = document.getElementById("resetAllTasks")
const openAddingTaskFormButton = document.getElementById(
  "openAddingTaskFormButton"
)

// API URL
const API_URL = "http://localhost:3001/api/advanced/tasks"
const JSON_URL = "http://localhost:3001/db"

////////////////////////////////////////////////////////////////////////////////////
// Utility functions
////////////////////////////////////////////////////////////////////////////////////

//Function to check if the date is in the future
function isValideDate(inputDate) {
  const currentDate = new Date()
  const enteredDate = new Date(inputDate)
  return enteredDate >= currentDate
}

//Function to check if the input is a string
function isString(input) {
  return typeof input === "string"
}

//Function to format the date
function formatDate(inputDate) {
  const date = new Date(inputDate)
  const options = { year: "numeric", month: "long", day: "numeric" }
  return date.toLocaleDateString("fr-FR", options)
}

//Function to close the addingTaskPopup
function closeAddingTaskPopup() {
  addingTaskPopup.style.display = "none"
  overlay.style.display = "none"
}

//Function to open the addingTaskPopup
function openAddingTaskPopup() {
  addingTaskPopup.style.display = "block"
  overlay.style.display = "block"
}

//Function to create a task card
function createTaskCard(task) {
  const taskDiv = document.createElement("div")
  taskDiv.className = "taskDiv"
  taskDiv.innerHTML = `
            <h2>${task.name}</h2>
            <p>${task.description}</p>
            <p>Écheance : ${formatDate(task.deadline)}</p>
            <p>${task.completed ? "Terminé" : "En cours"}</p>
            <button class="deleteButton" data-task-id="${
              task.id
            }">Supprimer</button>
            <button class="completeButton" data-task-id="${
              task.id
            }">Compléter</button>`
  allTaskDiv.appendChild(taskDiv)
}

////////////////////////////////////////////////////////////////////////////////////
// CRUD and Express Router functions
////////////////////////////////////////////////////////////////////////////////////

//Function to load all tasks from the API
async function loadAllTask() {
  try {
    const response = await fetch(`${JSON_URL}/tasks`)
    const data = await response.json()
    allTaskDiv.innerHTML = ""
    data.forEach((task) => {
      createTaskCard(task)
    })
    if (allTaskDiv.children.length === 0) {
      allTaskDiv.style.display = "none"
    }
    console.log("rechargement des stats")
    await loadStats()
  } catch (error) {
    console.error("Erreur lors du chargement des tâches :", error)
  }
}

//Function to load the statistics from the API
async function loadStats() {
  try {
    const response = await fetch(`${API_URL}/stats`)
    const data = await response.json()
    divStatNbTasks.innerHTML = `Nombre de taches : ${data.totalTasks}`
    divStatNbTasksCompleted.innerHTML = `Nombre de taches terminées : ${data.completedTasks}`
    divStatNbLateTask.innerHTML = `Nombre de taches en retard : ${data.lateTasks}`
  } catch (error) {
    console.error("Erreur lors du chargement des statistiques :", error)
  }
}

//Function to search for tasks by name
async function loadSearchedTask(taskName) {
  try {
    const response = await fetch(`${API_URL}/search?query=${taskName}`)
    const data = await response.json()
    allTaskDiv.innerHTML = ""
    data.forEach((task) => {
      createTaskCard(task)
    })
  } catch (error) {
    console.error("Erreur lors de la recherche de tâches :", error)
  }
}

//Function to load tasks that are due soon
async function loadDueSoonTask() {
  try {
    const response = await fetch(`${API_URL}/dueSoon`)
    const data = await response.json()
    allTaskDiv.innerHTML = ""
    data.forEach((task) => {
      createTaskCard(task)
    })
  } catch (error) {
    console.error("Erreur lors du chargement des tâches urgentes :", error)
  }
}

//Function to delete a task by ID
async function deleteTask(taskId) {
  try {
    await fetch(`${JSON_URL}/tasks/${taskId}`, {
      method: "DELETE",
    })
    await loadAllTask()
  } catch (error) {
    console.error("Erreur lors de la suppression de la tâche :", error)
  }
}

//Function to validate or reset all tasks
async function validateOrResetAllTasks(action) {
  try {
    await fetch(`${API_URL}/${action}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })
    await loadAllTask()
    await loadStats()
  } catch (error) {
    console.error(
      "Erreur lors de la modification de toutes les tâches :",
      error
    )
  }
}

//Function to add a new task
async function addingANewTask(taskName, taskDescription, taskDeadline) {
  try {
    await fetch(`${JSON_URL}/tasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: taskName,
        description: taskDescription,
        deadline: taskDeadline,
        completed: false,
      }),
    })
    await loadAllTask()
    await loadStats()
    await closeAddingTaskPopup()
  } catch (error) {
    console.error("Erreur lors de l'ajout de la tâche :", error)
  }
}

//Function to complete a task by ID
async function completeTask(taskId) {
  try {
    await fetch(`${JSON_URL}/tasks/${taskId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        completed: true,
      }),
    })
    await loadAllTask()
  } catch (error) {
    console.error("Erreur lors de la validation de la tâche :", error)
  }
}

////////////////////////////////////////////////////////////////////////////////////
//Event Listeners
////////////////////////////////////////////////////////////////////////////////////

//EventListener to verify input and add a new task
buttonAddTask.addEventListener("click", async () => {
  const taskName = document.getElementById("taskName").value
  const taskDescription = document.getElementById("taskDescription").value
  const taskDeadline = document.getElementById("taskDeadline").value

  if (taskName === "" || taskDeadline === "" || taskDescription === "") {
    alert("Tous les champs sont obligatoires")
    return
  }

  if (taskDeadline !== "" && !isValideDate(taskDeadline)) {
    alert("La date d'echeance doit etre dans le futur")
    return
  }

  if (!isString(taskName) || !isNaN(taskName.trim())) {
    alert(
      "Le nom de la tâche doit être une chaîne de caractères et ne peut pas être juste un nombre"
    )
    return
  }

  if (!isString(taskDescription) || !isNaN(taskDescription.trim())) {
    alert(
      "La description de la tâche doit être une chaîne de caractères et ne peut pas être juste un nombre"
    )
    return
  }

  addingANewTask(taskName, taskDescription, taskDeadline)
})

//EventListener to delete a task
allTaskDiv.addEventListener("click", (e) => {
  if (e.target.classList.contains("deleteButton")) {
    const taskId = e.target.getAttribute("data-task-id")
    deleteTask(taskId)
  }
})

//EventListener to complete a task
allTaskDiv.addEventListener("click", (e) => {
  if (e.target.classList.contains("completeButton")) {
    const taskId = e.target.getAttribute("data-task-id")
    completeTask(taskId)
  }
})

//EventListener to search a task
buttonSearchedTask.addEventListener("click", async (event) => {
  event.preventDefault()
  await loadSearchedTask(document.getElementById("taskSearched").value)
  await loadStats()
})

//EventListener to validate tasks
validateAllTaskButton.addEventListener("click", async () => {
  validateOrResetAllTasks("completeAll")
})

//EventListener to reset tasks
resetAllTaskButton.addEventListener("click", async () => {
  validateOrResetAllTasks("resetAll")
})

//EventsListener to close the addingTaskPopup
overlay.addEventListener("click", (e) => {
  if (e.target === overlay) {
    closeAddingTaskPopup()
  }
})

//EventListener to open the addingTaskPopup
openAddingTaskFormButton.addEventListener("click", () => {
  openAddingTaskPopup()
})

//Loading all task at the start
loadAllTask()
