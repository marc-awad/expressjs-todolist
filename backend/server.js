const express = require('express');
const jsonServer = require('json-server');

// Initialisation d'Express
const app = express();

// Middleware pour lire le JSON dans le body des requêtes POST/PUT/PATCH
app.use(express.json());

// Création du routeur json-server basé sur le fichier db.json
const router = jsonServer.router('db.json');

// Middlewares par défaut de json-server (logs, CORS, etc.)
const middlewares = jsonServer.defaults();

// On utilise ces middlewares
app.use(middlewares);