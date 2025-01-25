// Base file for routes
const express = require("express")
const jsonServer = require("json-server")

const PORT = 3001

// Initialize Express
const app = express()

// Middleware to read JSON in the body of POST/PUT/PATCH requests
app.use(express.json())

// Create the json-server router based on the db.json file
const router = jsonServer.router("./db.json")
const advancedTaskRoutes = require("./routes/advancedTaskRoutes")

// Default middlewares for json-server (logs, CORS, etc.)
const middlewares = jsonServer.defaults()

// Use these middlewares
app.use(middlewares)

app.use("/db", router)

app.use("/api/advanced/tasks", advancedTaskRoutes)

// Start the server
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}: http://localhost:${PORT}/`)
})
