const express = require('express');
const router = express.Router();
const taskController = require('../controllers/task.controller');
const auth = require('../middleware/authentication'); 


router.use(auth); 

router.post('/', taskController.createTask);
router.get('/', taskController.getTasks);
router.patch('/assign/:taskId', taskController.assignTask);
router.delete('/:taskId', taskController.deleteTask);

module.exports = router;