const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const auth = require('../middleware/authentication'); 


router.post('/register', userController.signup);
router.post('/login', userController.signin);



router.use(auth)

router.get('/', userController.getAllUsers); 
router.get('/profile', userController.getProfile);
router.patch('/profile', userController.updateProfile);






module.exports = router;