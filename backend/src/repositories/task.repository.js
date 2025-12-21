const TaskModel  = require("../models/task.model");

class TaskRepository {
    async create(taskData) {
        return await TaskModel.create(taskData);
    }


    //todo pagination

    // Generic search with filters and sorting
    async findTasks(filters, sortOptions = { dueDate: 1 }) {
        return await TaskModel.find(filters).sort(sortOptions);
    }

    
    async findByUserId(userId, filters = {}, sortBy = { dueDate: 1 }) {
        const query = { 
            $or: [{ creatorId: userId }, { assignedTo: userId }], 
            ...filters 
        };
        return await TaskModel.find(query).sort(sortBy).populate('assignedTo', 'name email');
    }



    async findById(taskId) {
        return await TaskModel.findById(taskId);
    }

    async delete(taskId) {
        return await TaskModel.deleteOne({ _id: taskId });
    }

   
    async update(taskId, updateData) {
        return await TaskModel.findByIdAndUpdate(
            taskId, 
            { $set: updateData }, 
            { new: true, runValidators: true } 
        );
    }


    async addAssignee(taskId, userId) {
        return await TaskModel.findByIdAndUpdate(
            taskId,
            { $addToSet: { assignedTo: userId } }, 
            { new: true }
        );
    }
}

module.exports = new TaskRepository();