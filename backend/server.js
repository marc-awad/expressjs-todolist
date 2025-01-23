//Fichier de base pour les routes
const express = require("express")
const jsonServer = require("json-server")

const PORT = 3001

// Initialisation d'Express
const app = express()

// Middleware pour lire le JSON dans le body des requêtes POST/PUT/PATCH
app.use(express.json())

// Création du routeur json-server basé sur le fichier db.json
const router = jsonServer.router("./db.json")
const advancedTaskRoutes = require("./routes/advancedTaskRoutes")

// Middlewares par défaut de json-server (logs, CORS, etc.)
const middlewares = jsonServer.defaults()

// On utilise ces middlewares
app.use(middlewares)


app.use("/db", router)

app.use("/api/advanced/tasks", advancedTaskRoutes)


// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT} : http://localhost:${PORT}/`)
})
