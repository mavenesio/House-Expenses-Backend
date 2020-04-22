const mongoose = require('mongoose');
require('dotenv').config({path: 'variable.env'});



const connectDB = async () => {

    try {

        await mongoose.connect(process.env.DB_MONGO, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: true,
            useCreateIndex: true,
        });
        console.log('Connection success');
    } catch (err) {
        console.log('Connection Error: ', err);
        process.exit(1);
    }


}


module.exports = connectDB;

