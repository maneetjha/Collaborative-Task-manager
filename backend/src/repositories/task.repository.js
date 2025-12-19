const { TodoModel } = require("../models/task");

class TaskRepository {
    async create(taskData) {
        return await TodoModel.create(taskData);
    }

    async findByUserId(userId) {
        // Populating 'assignedTo' for the collaboration requirement
        return await TodoModel.find({ userID: userId }).populate('assignedTo', 'name email');
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