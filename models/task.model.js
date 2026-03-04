const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    project: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Project', 
        required: true 
    }, // Refers to Project model
    team: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Team',
        required: true 
    }, // Refers to Team model
    owners: [
        { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'User', 
            required: true 
        } // Refers to User model (owners)
    ],
    tags: [{ type: String }], // Array of tags
    timeToComplete: { 
        type: Number, 
        required: true 
    }, // Number of days to complete the task
    status: {
        type: String,
        enum: ['to-do', 'in-progress', 'completed', 'blocked'], // Enum for task status
        default: 'To Do'
    }, // Task status
},
{
    timestamps: true,
});

TaskSchema.pre(["find","findOne"], function(){
    this.populate("owners").populate("team").populate("project");
});

module.exports = mongoose.model("Task", TaskSchema);