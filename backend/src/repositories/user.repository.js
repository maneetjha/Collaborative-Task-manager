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
}

module.exports = new UserRepository();