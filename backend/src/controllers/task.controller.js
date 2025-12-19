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
            // taskId comes from the URL (:taskId)
            // targetUserId comes from the JSON body
            const { taskId } = req.params; 
            const { targetUserId } = req.body;
            const requesterId = req.userid;

            if (!taskId || !targetUserId) {
                return res.status(400).json({ message: "taskId and targetUserId are required" });
            }
    
           
            const result = await taskService.assignTask(taskId, targetUserId, requesterId);
            
            if (result.alreadyAssigned) {
                return res.status(200).json({ 
                    message: result.message 
                });
            }
    
            res.json({ 
                message: "Task assigned successfully", 
                task: result.task 
            });

        } catch (error) {
            const statusCode = error.message.includes("authorized") ? 403 : 400;
            res.status(statusCode).json({ message: error.message });
        }
    }

    async deleteTask(req, res) {
        try {
            const { taskId } = req.params;
            const requesterId = req.userid; 
    
            if (!taskId) {
                return res.status(400).json({ message: "taskId is required in the request body" });
            }

            await taskService.removeTask(taskId, requesterId);
            
            res.json({ message: "Task deleted successfully" });
        } catch (error) {
            const statusCode = error.message.includes("authorized") ? 403 : 404;
            res.status(statusCode).json({ message: error.message });
        }
    }
}

module.exports = new TaskController();