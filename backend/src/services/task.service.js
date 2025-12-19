const taskRepository = require("../repositories/task.repository");
const { notifyUser, broadcastUpdate } = require("../utils/socket.util");

class TaskService {
    // 1. Create Task + Broadcast to everyone online
    async createNewTask(data, userId) {
        const taskPayload = {
            title: data.todo || data.title, 
            description: data.description || "",
            status: data.status || 'To-Do',
            priority: data.priority || 'Medium',
            dueDate: data.dueDate,
            userID: userId
        };
        
        const newTask = await taskRepository.create(taskPayload);
        
        // Notify all users that a new task exists for the dashboard
        broadcastUpdate('TASK_CREATED', newTask);
        
        return newTask;
    }

    // 2. Updated to support Filtering and Sorting (Required for Dashboard)
    async getAllTasks(userId, filters = {}, sortBy = 'dueDate') {
        // Build the sort object (e.g., { dueDate: 1 })
        const sortOptions = {};
        sortOptions[sortBy] = 1; 

        return await taskRepository.findByUserId(userId, filters, sortOptions);
    }

    // 3. Assign Task + Private Notification
    async assignTask(taskId, targetUserId) {
        const updatedTask = await taskRepository.update(taskId, { assignedTo: targetUserId });

        if (!updatedTask) throw new Error("Task not found");

        // Targeted notification to the assignee
        notifyUser(targetUserId, 'TASK_ASSIGNED', {
            message: `You have been assigned a new task: ${updatedTask.title}`,
            taskId: updatedTask._id
        });

        // Broadcast update so others see the "Assignee" label change
        broadcastUpdate('TASK_UPDATED', updatedTask);

        return updatedTask;
    }

    async removeTask(taskId, userId) {
        const result = await taskRepository.delete(taskId, userId);
        if (result.deletedCount === 0) {
            throw new Error("Task not found or unauthorized");
        }

        // Notify everyone that a task was removed
        broadcastUpdate('TASK_REMOVED', { taskId });
        
        return result;
    }
}

module.exports = new TaskService();