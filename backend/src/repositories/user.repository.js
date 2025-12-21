const UserModel = require("../models/user.model");

class UserRepository {
    async findByEmail(email) {
        return await UserModel.findOne({ email });
    }

    async findById(id) {
        return await UserModel.findById(id).select("-password"); // Exclude password for safety
    }

    async create(userData) {
        return await UserModel.create(userData);
    }

    async findAll() {
        return await UserModel.find({}, 'name email _id'); 
    }

    async findById(userId) {
        return await UserModel.findById(userId).select('-password');
    }

    async update(userId, updateData) {
        return await UserModel.findByIdAndUpdate(
            userId,
            updateData,
            { new: true, runValidators: true }
        ).select('-password');
    }
}

module.exports = new UserRepository();