const mongoose = require('mongoose');

// User Schema
const userSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true 
    }, // User's name
    email: { 
        type: String, 
        required: true, 
        unique: true 
    }, // Email must be unique
    password: {
        type: String, 
        required: true, 
    },
    role: {
        type: String,
        enum: ["admin","user"],
        default: "user",
    },
    team: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Team",  
    }
},
{
    timestamps: true,
});

module.exports = mongoose.model('User', userSchema);