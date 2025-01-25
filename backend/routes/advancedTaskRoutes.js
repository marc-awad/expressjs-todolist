// Import necessary modules
const express = require("express");
const jsonServer = require("json-server");

// Express and JSON Router
const router = express.Router();
const routerDBJSON = jsonServer.router("db.json");

// Declaration of constant MESSAGES
const MESSAGES = {
  TASKS_VALIDATED: "All tasks have been validated",
  TASKS_RESET: "All tasks have been reset",
  NO_TASKS_FOUND: "No tasks found.",
};

// Utility functions
function isLateTask(deadline) {
  if (!deadline || isNaN(new Date(deadline).getTime())) return false;
  return new Date() > new Date(deadline);
}

function updateAllTasksCompletion(db, tasks, completionStatus) {
  tasks.forEach((task) => {
    task.completed = completionStatus;
  });
  return db.write(); // Ensure to return the promise for error handling
}

// Route 1: Statistics
router.get("/stats", (req, res) => {
  const db = routerDBJSON.db;
  const tasks = db.get("tasks").value();

  let completedTaskCount = 0;
  let lateTaskCount = 0;
  tasks.forEach((task) => {
    if (task.completed) {
      completedTaskCount += 1;
      return;
    }
    if (isLateTask(task.deadline)) {
      lateTaskCount += 1;
    }
  });
  res.status(200).json({
    totalTasks: tasks.length,
    completedTasks: completedTaskCount,
    lateTasks: lateTaskCount,
  });
});

// Route 2: Tasks due in the next 7 days
router.get("/dueSoon", (req, res) => {
  const db = routerDBJSON.db;
  const tasks = db.get("tasks").value();

  const today = new Date();
  const nextWeek = new Date();
  nextWeek.setDate(today.getDate() + 7);

  const dueSoonTasks = tasks.filter((task) => {
    if (!task.deadline) return false;
    const deadlineDate = new Date(task.deadline);
    return deadlineDate >= today && deadlineDate <= nextWeek;
  });

  res.status(200).json(dueSoonTasks);
});

// Route 3: Search by string
router.get("/search", (req, res) => {
  const searchParameter = req.query.query;
  if (!searchParameter) {
    return res.status(400).json({ message: "The 'query' parameter is required." });
  }

  const db = routerDBJSON.db;
  const tasks = db.get("tasks").value();

  const filteredTasks = tasks.filter((task) => {
    return (
      task.name.toLowerCase().includes(searchParameter.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchParameter.toLowerCase())
    );
  });
  if (filteredTasks.length === 0) {
    return res.status(404).json({ message: MESSAGES.NO_TASKS_FOUND });
  }

  res.status(200).json(filteredTasks);
});

// Route 4: Mark all tasks as "completed: true"
router.post("/completeAll", (req, res) => {
  const db = routerDBJSON.db;
  const tasks = db.get("tasks").value();

  if (tasks.length === 0) {
    return res.status(404).json({ message: MESSAGES.NO_TASKS_FOUND });
  }

  updateAllTasksCompletion(db, tasks, true);

  res.status(200).json({ message: MESSAGES.TASKS_VALIDATED, tasks });
});

// Route 5: Mark all tasks as "completed: false"
router.post("/resetAll", (req, res) => {
  const db = routerDBJSON.db;
  const tasks = db.get("tasks").value();

  if (tasks.length === 0) {
    return res.status(404).json({ message: MESSAGES.NO_TASKS_FOUND });
  }

  updateAllTasksCompletion(db, tasks, false);

  res.status(200).json({ message: MESSAGES.TASKS_RESET, tasks });
});

module.exports = router;