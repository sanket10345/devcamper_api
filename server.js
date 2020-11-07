const path = require('path')
const express =require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const colors = require('colors');
const fileupload = require('express-fileupload');
const errorHandler = require('./middleware/error');
const connectDB = require('./config/db');

dotenv.config({ path: './config/config.env'});

//Connect to database
connectDB();

//Route files
const bootcamp = require('./routes/bootcamps');
const courses = require('./routes/courses');
const app = express();

//Body Parser
app.use(express.json(path.join(__dirname, 'public')))

//Dev Logging Middleware
if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'));
}

// File Upload
app.use(fileupload());

// Set Static
app.use(express.static(path.join(__dirname, 'public')));

// Mount Router
app.use('/api/v1/bootcamps', bootcamp)
app.use('/api/v1/courses', courses)
app.use(errorHandler);
const PORT = process.env.PORT || 5000 ;

const server =app.listen(PORT, console.log(`Server running in ${process.env.NODE_ENV} on port ${PORT}`.yellow.bold));

//Handle Unhandled Promise Rejection
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`.red)
    // Close Server & exit process
    server.close(() => process.exit(1));
}) 