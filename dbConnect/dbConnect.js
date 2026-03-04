const mongoose = require("mongoose");
require("dotenv").config();

const mongoUri = process.env.MONGO_URI;

const initialiseDatabase = async()=>{
    try {
        await mongoose.connect(mongoUri);
            console.log("Established Connection to Database.")
        
    } catch (error) {
            console.error("Error while connecting.", error.message); 
    }
}

module.exports = { initialiseDatabase };