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


   
    async getCreatedTasks(userId, query) {
        const filters = { creatorId: userId, ...this._buildFilters(query) };
        return await taskRepository.findTasks(filters, this._buildSort(query));
    }
    
  
    async getAssignedTasks(userId, query) {
        const filters = { 
            assignedTo: userId, 
            creatorId: { $ne: userId }, 
            ...this._buildFilters(query) 
        };
        return await taskRepository.findTasks(filters, this._buildSort(query));
    }
    
    
    async getOverdueTasks(userId, query) {
        const filters = {
            $or: [{ creatorId: userId }, { assignedTo: userId }],
            dueDate: { $lt: new Date() }, 
            status: { $ne: 'Completed' }, 
            ...this._buildFilters(query)
        };
        return await taskRepository.findTasks(filters, this._buildSort(query));
    }

    _buildFilters(query) {
        const filter = {};
        if (query.status) filter.status = query.status;
        if (query.priority) filter.priority = query.priority;
        return filter;
    }

    _buildSort(query) {
        return { dueDate: query.order === 'desc' ? -1 : 1 };
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


    async updateTask(taskId, userId, updateData) {
        const task = await taskRepository.findById(taskId);
        if (!task) throw new Error("Task not found");
    
        const isCreator = task.creatorId.toString() === userId.toString();
        const isAssignee = task.assignedTo.some(id => id.toString() === userId.toString());
    
        if (!isCreator && !isAssignee) {
            throw new Error("Not authorized to access this task");
        }
    
        //ROLE-BASED RESTRICTION
        
        if (!isCreator && isAssignee) {
            const allowedFields = ['status'];
            const filteredUpdate = {};
    
            allowedFields.forEach(field => {
                if (updateData[field] !== undefined) {
                    filteredUpdate[field] = updateData[field];
                }
            });
    
           
            const attemptedFields = Object.keys(updateData);
            const hasForbiddenFields = attemptedFields.some(field => !allowedFields.includes(field));
    
            if (hasForbiddenFields) {
                throw new Error("Assignees can only update the status of a task.");
            }
    
            return await taskRepository.update(taskId, filteredUpdate);
        }
    
        // If they are the creator, they can update everything
        return await taskRepository.update(taskId, updateData);
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