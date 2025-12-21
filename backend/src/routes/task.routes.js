const express = require('express');
const router = express.Router();
const taskController = require('../controllers/task.controller');
const auth = require('../middleware/authentication'); 


router.use(auth); 

router.post('/', taskController.createTask);
router.patch('/assign/:taskId', taskController.assignTask);
router.delete('/:taskId', taskController.deleteTask);


router.get('/created',  taskController.getCreatedTasks);
router.get('/assigned',  taskController.getAssignedTasks);
router.get('/overdue',  taskController.getOverdueTasks);
router.get('/:id', taskController.getTaskById);
router.patch('/:id', taskController.updateTask);

module.exports = router;