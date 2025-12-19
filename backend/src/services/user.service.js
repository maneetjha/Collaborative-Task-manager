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
}

module.exports = new UserService();