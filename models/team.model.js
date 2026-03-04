const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true, 
        unique: true 
    }, // Team names must be unique
    description: { 
        type: String 
    } // Optional description forthe team
},
{
    timestamps: true,
});

module.exports = mongoose.model('Team', teamSchema);