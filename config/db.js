//here is where we do our MongoDB connection
const mongoose = require('mongoose');
const config = require('config');
const db = config.get('mongoURI');

//to connect to MongoDb
//we will be using async function instead of promise
const connectDB = async () => {
    try {
        await mongoose.connect(db, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
            useFindAndModify: false
        });
        
        console.log('MongoDB Connected...');
    } catch(err) {
        console.log(err.message);
        //exit process with failure
        process.exit(1);
    }
}
module.exports = connectDB;