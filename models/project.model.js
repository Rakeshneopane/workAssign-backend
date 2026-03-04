const mongoose = require('mongoose');

// Project Schema
const projectSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true, 
        unique: true
    }, // Project names must be unique
    description: { 
        type: String 
    }, // Optional field for project details
},
{
    timestamps: true,
});

module.exports = mongoose.model('Project', projectSchema);