//Holds code to connect to Remote Mongo DB Connection
const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_DB_CONNECTION_URL = process.env.MONGO_DB_CONNECTION_URL;

async function connectToDatabase() {
    if (!MONGO_DB_CONNECTION_URL) {
        console.error('MONGO_DB_CONNECTION_URL is not defined in environment variables.');
        process.exit(1); // Exit app if env var is missing
    }

    try {
        await mongoose.connect(MONGO_DB_CONNECTION_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log('Connected to MongoDB successfully.');
    } catch (error) {
        console.error('MongoDB connection failed:', error.message);
        process.exit(1); // Stop app if DB fails to connect
    }
}

module.exports = { connectToDatabase };