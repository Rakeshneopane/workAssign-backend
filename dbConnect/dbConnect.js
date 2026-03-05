const mongoose = require("mongoose");
require("dotenv").config();

const mongoUri = process.env.MONGO_URI;
let isConnecnted = false;

const initialiseDatabase = async()=>{
    if (isConnecnted) return;
    try {
        const db = await mongoose.connect(mongoUri);
        isConnecnted = db.connections[0].readyState;    
        console.log("Established Connection to Database.")
        
    } catch (error) {
            console.error("Error while connecting.", error.message); 
    }
}

module.exports = { initialiseDatabase };