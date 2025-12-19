const taskService = require("../services/task.service");

class TaskController {
    async createTask(req, res) {
        try {
            const task = await taskService.createNewTask(req.body, req.userid);
            res.status(201).json(task);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async getTasks(req, res) {
        try {
            const tasks = await taskService.getAllTasks(req.userid);
            res.json({ tasks });
        } catch (error) {
            res.status(500).json({ message: "Error fetching tasks" });
        }
    }

    async assignTask(req, res) {
        try {
            const { taskId, targetUserId } = req.body;
            
            // We call the Service here
            const updatedTask = await taskService.assignTask(taskId, targetUserId);
            
            res.json({ message: "Task assigned successfully", task: updatedTask });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async deleteTask(req, res) {
        try {
            const { todoid } = req.body;
            await taskService.removeTask(todoid, req.userid);
            res.json({ message: "Deleted successfully" });
        } catch (error) {
            res.status(404).json({ message: error.message });
        }
    }
}

module.exports = new TaskController();