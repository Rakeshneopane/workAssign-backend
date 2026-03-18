const mongoose = require("mongoose");
require("dotenv").config();

const mongoUri = process.env.MONGO_URI;
let cachedConnection = null;

const initialiseDatabase = async () => {

    if (mongoose.connection.readyState >= 1) {
        return;
    }

    if (!cachedConnection) {
        console.log("Creating new database connection...");
        cachedConnection = mongoose.connect(mongoUri);
    }

    try {
        await cachedConnection;
        console.log("Established Connection to Database.");
    } catch (error) {
        cachedConnection = null; // Reset cache on error
        console.error("Error while connecting.", error.message);
        throw error;
    }
}

module.exports = { initialiseDatabase };