const taskService = require("../services/task.service");
const { notifyUser, broadcastUpdate } = require("../utils/socket.util");

class TaskController {
    async createTask(req, res) {
        try {
            const task = await taskService.createNewTask(req.body, req.userid);
            res.status(201).json(task);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async getCreatedTasks(req, res) {
        try {
            const tasks = await taskService.getCreatedTasks(req.userid, req.query); 
            res.json({ message: "Created tasks retrieved", tasks });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    
    async getAssignedTasks(req, res) {
        try {
            const tasks = await taskService.getAssignedTasks(req.userid, req.query);
            res.json({ message: "Assigned tasks retrieved", tasks });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }


    async getOverdueTasks(req, res) {
        try {
            const tasks = await taskService.getOverdueTasks(req.userid, req.query);
            res.json({ count: tasks.length, tasks });
        } catch (error) {
            res.status(500).json({ message: error.message });
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


    async updateTask(req, res) {
        try {
            const { id } = req.params;
            const updatedTask = await taskService.updateTask(id, req.userid, req.body);
    
            
            broadcastUpdate('TASK_UPDATED', updatedTask);
    
           
            if (req.body.status === 'Completed') {
                notifyUser(updatedTask.creatorId, 'TASK_FINISHED', {
                    message: `Task "${updatedTask.title}" has been completed!`,
                    taskId: updatedTask._id
                });
            }
    
            res.json({ message: "Task updated successfully", task: updatedTask });
            
        } catch (error) {
            res.status(403).json({ message: error.message });
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