const userService = require("../services/user.service");
const { z } = require("zod");


const usersignupschema = z.object({
    name: z.string().min(2).max(30),
    email: z.string().email(),
    password: z.string().min(6),
});

class UserController {
    async signup(req, res) {
        try {

            const validation = usersignupschema.safeParse(req.body);
            if (!validation.success) {
                return res.status(400).json({ msg: validation.error.issues[0].message });
            }

            const { name, email, password } = req.body;
            await userService.registerUser(name, email, password);
            
            
            res.status(201).json({ msg: "User registered successfully" });

        } catch (error) {

            res.status(400).json({ msg: error.message });

        }

    }

    async signin(req, res) {
        try {
            const { email, password } = req.body;
            const result = await userService.loginUser(email, password);
            res.json(result);
        } catch (error) {
            res.status(401).json({ msg: error.message });
        }
    }
}

module.exports = new UserController();