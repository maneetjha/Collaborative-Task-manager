const taskRepository = require("../repositories/task.repository");
const userRepository = require("../repositories/user.repository");
const { notifyUser, broadcastUpdate } = require("../utils/socket.util");

class TaskService {

    
    async createNewTask(data, userId) {
        const taskPayload = {
            title: data.todo || data.title, 
            description: data.description || "",
            status: data.status || 'To-Do',
            priority: data.priority || 'Medium',
            dueDate: data.dueDate,
            creatorId: userId
        };
        
        const newTask = await taskRepository.create(taskPayload);
        
    
        broadcastUpdate('TASK_CREATED', newTask);
        
        return newTask;
    }


   
    async getAllTasks(userId, filters = {}, sortBy = 'dueDate') {
        
        const sortOptions = {};
        sortOptions[sortBy] = 1; 

        return await taskRepository.findByUserId(userId, filters, sortOptions);
    }




    async assignTask(taskId, targetUserId, requesterId) {
  
        const task = await taskRepository.findById(taskId);
        if (!task) throw new Error("Task not found");

        const requester = await userRepository.findById(requesterId);
        const requesterName = requester.name;
    

        if (task.creatorId.toString() !== requesterId.toString()) {
            throw new Error("You are not authorized to assign this task");
        }

        const targetUser = await userRepository.findById(targetUserId);
        if (!targetUser) {
            throw new Error("Target user does not exist. Assignment failed.");
        }
    
      
        const isAlreadyAssigned = task.assignedTo.some(id => id.toString() === targetUserId.toString());

        if (!isAlreadyAssigned) {
            
            const updatedTask = await taskRepository.addAssignee(taskId, targetUserId);

            
            notifyUser(targetUserId, 'TASK_ASSIGNED', {
                message: `You have been added to task: ${updatedTask.title}`,
                taskId: updatedTask._id,
                assignedBy: requesterName
            });

            broadcastUpdate('TASK_UPDATED', updatedTask);
            
            return { 
                task: updatedTask, 
                alreadyAssigned: false, 
                message: "Task assigned successfully" 
            };
        }
        
        return { 
            task: task, 
            alreadyAssigned: true, 
            message: "User was already part of this task" 
        };
    
    }
    

    async removeTask(taskId, requesterId) {
        const task = await taskRepository.findById(taskId);
        
        if (!task) {
            throw new Error("Task not found");
        }
    
        if (task.creatorId.toString() !== requesterId.toString()) {
            throw new Error("You are not authorized to delete this task");
        }
    
        
        await taskRepository.delete(taskId);
    
     
        const { broadcastUpdate } = require('../utils/socket.util');
        broadcastUpdate('TASK_DELETED', { taskId });
    
        return true;
    }
}

module.exports = new TaskService();