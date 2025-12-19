const TaskController = require("./controllers/task.controller");
const auth = require("./middleware/authentication");


app.get("/todo", auth, (req, res) => TaskController.getTasks(req, res));
app.post("/todo", auth, (req, res) => TaskController.createTask(req, res));
app.patch("/todo/assign", auth, (req, res) => TaskController.assignTask(req, res));   
app.delete("/todo", auth, (req, res) => TaskController.deleteTask(req, res));
 