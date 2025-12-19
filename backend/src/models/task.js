const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },

  description: { type: String },

  status: { 
    type: String, 
    enum: ['To-Do', 'In-Progress', 'Completed'], 
    default: 'To-Do' 
  },

  priority: { 
    type: String, 
    enum: ['Low', 'Medium', 'High'], 
    default: 'Medium' 
  },

  dueDate: { type: Date },
  
  userID: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } 
  // For collaboration
},{ timestamps: true });


const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});


module.exports = {
  UserModel: mongoose.model('User', UserSchema),
  TaskModel: mongoose.model('Task', TaskSchema)
};