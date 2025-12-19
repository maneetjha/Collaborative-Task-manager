const taskRepository = require("../repositories/task.repository");

class TaskService {
    async createNewTask(data, userId) {
      
        const taskPayload = {
            title: data.todo || data.title, 
            description: data.description || "",
            status: data.status || 'To-Do',
            priority: data.priority || 'Medium',
            dueDate: data.dueDate,
            userID: userId
        };
        
        return await taskRepository.create(taskPayload);
    }

    async getAllTasks(userId) {
        return await taskRepository.findByUserId(userId);
    }

    async removeTask(taskId, userId) {
        const result = await taskRepository.delete(taskId, userId);
        if (result.deletedCount === 0) {
            throw new Error("Task not found or unauthorized");
        }
        return result;
    }
}

module.exports = new TaskService();