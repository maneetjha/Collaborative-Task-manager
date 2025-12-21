const userRepository = require("../repositories/user.repository");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;


class UserService {
    async registerUser(name, email, password) {
        const existingUser = await userRepository.findByEmail(email);
        if (existingUser) {
            throw new Error("User already exists");
        }

        const hashedPassword = await bcrypt.hash(password, 5); 
        
        return await userRepository.create({
            name,
            email,
            password: hashedPassword
        });
    }



    async loginUser(email, password) {
        const user = await userRepository.findByEmail(email);
        if (!user) {
            throw new Error("Invalid Credentials");
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new Error("Invalid Credentials");
        }

 
        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '24h' });
        return { token, user: { id: user._id, name: user.name, email: user.email } };
    }

    async getAllUsers() {
        return await userRepository.findAll();
    }


    async getUserProfile(userId) {
        const user = await userRepository.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }
        return user;
    }

    async updateUserProfile(userId, updateData) {
        const user = await userRepository.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        // Check if email is being changed and if it already exists
        if (updateData.email && updateData.email !== user.email) {
            const existingUser = await userRepository.findByEmail(updateData.email);
            if (existingUser) {
                throw new Error('Email already exists');
            }
        }

        const updatedUser = await userRepository.update(userId, updateData);
        return updatedUser;
    }
}

module.exports = new UserService();