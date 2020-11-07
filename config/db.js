const mongoose = require('mongoose');

const connectDB = async () =>{
    console.log(`MongoDb Connecting ...`)
    const conn = await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: true,
        useUnifiedTopology: true        
    });
    console.log(`MongoDb Connected ${conn.connection.host}`.cyan.underline.bold)
    
}

module.exports = connectDB;