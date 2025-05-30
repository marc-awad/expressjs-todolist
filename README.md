﻿# Express.js TodoList

A simple todo list project using **Express.js** and **JSON Server** for data management.

## Prerequisites

Before you begin, make sure you have the following installed on your machine:

- **Node.js**: [Download here](https://nodejs.org/)
- **npm**: Comes with the Node.js installation

## Installation

1. Clone this repository to your local machine:

   ```bash
   git clone https://github.com/marc-awad/expressjs-todolist.git
   cd expressjs-todolist
   ```

2. Install the necessary dependencies:

   ```bash
   npm install express
   ```

3. Install **JSON Server** globally if you haven't already:
   ```bash
   npm install -g json-server@0.17.0
   ```

## Running the Project

1. Start the JSON Server (not usually necessary):

   ```bash
   json-server --watch db.json
   ```

2. Start the Express.js server (should work on its own):

   ```bash
   node server.js
   ```

3. Listen on the corresponding port:

   ```bash
      localhost:3000
   ```

## Features

- Add tasks
- Delete tasks
- Complete tasks
- Display the list of tasks
- Search specific tasks
- Complete all tasks
- Reset all tasks
