// Déclaration des modules nécessaires
const express = require("express")
const jsonServer = require("json-server")

//Router Express et JSON
const router = express.Router()
const routerDBJSON = jsonServer.router("db.json")

//Déclaration de ma constante MESSAGES
const MESSAGES = {
  TASKS_VALIDATED: "Toutes les tâches sont validées",
  TASKS_RESET: "Toutes les tâches sont réinitialisées",
  NO_TASKS_FOUND: "Aucune tâche trouvée.",
}

//Fonction utilitaires
function isLateTask(deadline) {
  if (!deadline || isNaN(new Date(deadline).getTime())) return false
  return new Date() > new Date(deadline)
}

function updateAllTasksCompletion(db, tasks, completionStatus) {
  tasks.forEach((task) => {
    task.completed = completionStatus
  })
  db.write()
}

//Route 1 : Statistiques
router.get("/stats", (req, res) => {
  const db = routerDBJSON.db
  const tasks = db.get("tasks").value()

  if (!tasks || tasks.length === 0) {
    return res.status(404).json({ message: MESSAGES.NO_TASKS_FOUND })
  }

  let endTaskNumber = 0
  let lateTaskNumber = 0
  tasks.forEach((task) => {
    if (task.completed) {
      endTaskNumber += 1
    }
    if (isLateTask(task.deadline)) {
      lateTaskNumber += 1
    }
  })
  res.status(200).json({
    totalTasks: tasks.length,
    completedTasks: endTaskNumber,
    lateTasks: lateTaskNumber,
  })
})

//Route 2 : Tâches à terminer dans les 7 prochains jours
router.get("/dueSoon", (req, res) => {
  const db = routerDBJSON.db
  const tasks = db.get("tasks").value()

  const today = new Date()
  const nextWeek = new Date()
  nextWeek.setDate(today.getDate() + 7)

  const dueSoonTasks = tasks.filter((task) => {
    if (!task.deadline) return false
    const deadlineDate = new Date(task.deadline)
    return deadlineDate >= today && deadlineDate <= nextWeek
  })

  res.status(200).json(dueSoonTasks)
})

//Route 3 : Recherche selon chaine de caractère
router.get("/search", (req, res) => {
  const searchParameter = req.query.query
  if (!searchParameter) {
    return res.status(400).json({ message: "Le paramètre 'query' est requis." })
  }

  const db = routerDBJSON.db
  const tasks = db.get("tasks").value()

  const filteredTasks = tasks.filter((task) => {
    return (
      task.name.toLowerCase().includes(searchParameter.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchParameter.toLowerCase())
    )
  })
  if (filteredTasks.length === 0) {
    return res.status(404).json({ message: MESSAGES.NO_TASKS_FOUND })
  }

  res.status(200).json(filteredTasks)
})

//Route 4 : Mettre toutes les tâches à "completed:true"
router.post("/completeAll", (req, res) => {
  const db = routerDBJSON.db
  const tasks = db.get("tasks").value()

  if (tasks.length === 0) {
    return res.status(404).json({ message: MESSAGES.NO_TASKS_FOUND })
  }

  updateAllTasksCompletion(db, tasks, true)

  res.status(200).json({ message: MESSAGES.TASKS_VALIDATED, tasks })
})

//Route 5 : Mettre toutes les tâches à "completed:false"

router.post("/resetAll", (req, res) => {
  const db = routerDBJSON.db
  const tasks = db.get("tasks").value()

  if (tasks.length === 0) {
    return res.status(404).json({ message: MESSAGES.NO_TASKS_FOUND })
  }

  updateAllTasksCompletion(db, tasks, false)

  res.status(200).json({ message: MESSAGES.TASKS_RESET, tasks })
})

module.exports = router
