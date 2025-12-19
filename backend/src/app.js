const TaskController = require("./controllers/task.controller");



app.post("/todo", auth, (req, res) => TaskController.createTask(req, res));
app.get("/todo", auth, (req, res) => TaskController.getTasks(req, res));
app.delete("/todo", auth, (req, res) => TaskController.deleteTask(req, res));