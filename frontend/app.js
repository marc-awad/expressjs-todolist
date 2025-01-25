//Récuperation des éléments du DOM
const buttonAddTask = document.getElementById("addNewTask")
const allTaskDiv = document.getElementById("allTaskDiv")
const popup = document.getElementById("popup")
const overlay = document.getElementById("overlay")
const divStatNbTasks = document.getElementById("statNbTasks")
const divStatNbLateTask = document.getElementById("statNbLateTask")
const divStatNbTasksCompleted = document.getElementById("statNbTasksCompleted")
const buttonSearchedTask = document.getElementById("searchButton")
const validateAllTaskButton = document.getElementById("validateAllTasks")
const resetAllTaskButton = document.getElementById("resetAllTasks")

//Constante pour les URL API
const API_URL = "http://localhost:3001/api/advanced/tasks"
const JSON_URL = "http://localhost:3001/db"

function isValideDate(inputDate) {
  const currentDate = new Date()
  const enteredDate = new Date(inputDate)
  return enteredDate >= currentDate
}

function isString(input) {
  return typeof input === "string"
}

function formatDate(inputDate) {
  const date = new Date(inputDate)
  const options = { year: "numeric", month: "long", day: "numeric" }
  return date.toLocaleDateString("fr-FR", options)
}

//Fonction utilitaire pour créer une carte de tache
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

//Fonction pour charger toutes les taches
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

//Fonction pour charger les statistiques
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

async function loadSearchedTask(taskName) {
  console.log(taskName)
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

//Fonction pour charger les taches urgentes
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

//Fonction pour supprimer une tache
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

//EventsListener pour fermer la popup
overlay.addEventListener("click", (e) => {
  popup.style.display = "none"
  overlay.style.display = "none"
})

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

//Fonction pour ouvrir la popup
function openAddTaskForm() {
  popup.style.display = "block"
  overlay.style.display = "block"
}

//EventListener pour charger toutes les taches au chargement de la page
document.addEventListener("DOMContentLoaded", (event) => {
  console.log("Rechargement appelé")
  loadAllTask()
})

//EventListener pour ajouter une nouvelle tache
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
    popup.style.display = "none"
    overlay.style.display = "none"
  } catch (error) {
    console.error("Erreur lors de l'ajout de la tâche :", error)
  }
})

//EventListener pour supprimer une tache
allTaskDiv.addEventListener("click", (e) => {
  if (e.target.classList.contains("deleteButton")) {
    const taskId = e.target.getAttribute("data-task-id")
    deleteTask(taskId)
  }
})

allTaskDiv.addEventListener("click", (e) => {
  if (e.target.classList.contains("completeButton")) {
    const taskId = e.target.getAttribute("data-task-id")
    completeTask(taskId)
  }
})

buttonSearchedTask.addEventListener("click", async (event) => {
  event.preventDefault()
  await loadSearchedTask(document.getElementById("taskSearched").value)
  await loadStats()
})

validateAllTaskButton.addEventListener("click", async () => {
  try {
    await fetch(`${API_URL}/completeAll`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })
    await loadAllTask()
    await loadStats()
  } catch (error) {
    console.error("Erreur lors de la validation de toutes les tâches :", error)
  }
})

resetAllTaskButton.addEventListener("click", async () => {
  try {
    await fetch(`${API_URL}/resetAll`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })
    await loadAllTask()
    await loadStats()
  } catch (error) {
    console.error(
      "Erreur lors de la réinitialisation de toutes les tâches :",
      error
    )
  }
})
