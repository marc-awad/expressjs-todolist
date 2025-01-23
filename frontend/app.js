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
            }">Supprimer</button>`
  allTaskDiv.appendChild(taskDiv)
}

//Fonction pour charger toutes les taches
function loadAllTask() {
  fetch(`${JSON_URL}/tasks`)
    .then((response) => response.json())
    .then((data) => {
      allTaskDiv.innerHTML = ""
      data.forEach((task) => {
        createTaskCard(task)
      })
      if (allTaskDiv.children.length === 0) {
        allTaskDiv.style.display = "none"
      }
    })
  loadStats()
}

//Fonction pour charger les statistiques
function loadStats() {
  fetch(`${API_URL}/stats`)
    .then((response) => response.json())
    .then((data) => {
      divStatNbTasks.innerHTML = `Nombre de taches : ${data.totalTasks}`
      divStatNbTasksCompleted.innerHTML = `Nombre de taches terminées : ${data.completedTasks}`
      divStatNbLateTask.innerHTML = `Nombre de taches en retard : ${data.lateTasks}`
    })
}

function loadSearchedTask(taskName) {
  console.log(taskName)
  fetch(`${API_URL}/search?query=${taskName}`)
    .then((response) => response.json())
    .then((data) => {
      allTaskDiv.innerHTML = ""
      data.forEach((task) => {
        createTaskCard(task)
      })
    })
}

//Fonction pour charger les taches urgentes
function loadDueSoonTask() {
  fetch(`${API_URL}/dueSoon`)
    .then((response) => response.json())
    .then((data) => {
      allTaskDiv.innerHTML = ""
      data.forEach((task) => {
        createTaskCard(task)
      })
    })
}

//Fonction pour supprimer une tache
function deleteTask(taskId) {
  fetch(`${JSON_URL}/tasks/${taskId}`, {
    method: "DELETE",
  })
    .then((response) => response.json())
    .then((data) => {
      loadAllTask()
    })
}

//EventsListener pour fermer la popup
overlay.addEventListener("click", (e) => {
  popup.style.display = "none"
  overlay.style.display = "none"
})

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
buttonAddTask.addEventListener("click", () => {
  popup.style.display = "none"
  overlay.style.display = "none"

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

  fetch(`${JSON_URL}/tasks`, {
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
    .then((response) => response.json())
    .then((data) => {
      loadAllTask()
      loadStats()
    })
})

//EventListener pour supprimer une tache
allTaskDiv.addEventListener("click", (e) => {
  if (e.target.classList.contains("deleteButton")) {
    const taskId = e.target.getAttribute("data-task-id")
    deleteTask(taskId)
  }
})

buttonSearchedTask.addEventListener("click", (event) => {
  event.preventDefault()
  loadSearchedTask(document.getElementById("taskSearched").value)
  loadStats()
})

validateAllTaskButton.addEventListener("click", () => {
  fetch(`${API_URL}/completeAll`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      loadAllTask()
      loadStats()
    })
})

resetAllTaskButton.addEventListener("click", () => {
  fetch(`${API_URL}/resetAll`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      loadAllTask()
      loadStats()
    })
})
