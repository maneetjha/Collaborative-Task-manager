const { TodoModel } = require("../models/task");

class TaskRepository {
    async create(taskData) {
        return await TodoModel.create(taskData);
    }

    async findByUserId(userId, filters = {}, sortBy = { dueDate: 1 }) {
        const query = { 
            $or: [{ userID: userId }, { assignedTo: userId }], 
            ...filters 
        };
        return await TodoModel.find(query).sort(sortBy).populate('assignedTo', 'name email');
    }

    async findById(taskId) {
        return await TodoModel.findById(taskId);
    }

    async delete(taskId, userId) {
        return await TodoModel.deleteOne({ _id: taskId, userID: userId });
    }

    async update(taskId, updateData) {
        return await TodoModel.findByIdAndUpdate(taskId, updateData, { new: true });
    }
}

module.exports = new TaskRepository();