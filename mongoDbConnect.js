//Holds code to connect to Remote Mongo DB Connection
const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_DB_CONNECTION_URL = process.env.MONGO_DB_CONNECTION_URL;

function connectToDatabase(){

    mongoose.connect(MONGO_DB_CONNECTION_URL);

    mongoose.connection.on('connected', ()=>{
        console.log(`DB Conection successfull!`);
    })
    // the event to listen on . on connected connection event , do this.....
    mongoose.connection.on('error', (err)=>{
        console.log(err);
        console.log("An error occured connecting to MongoDB");
})
}

module.exports = {connectToDatabase}