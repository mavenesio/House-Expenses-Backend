const mongoose = require('mongoose');


const ExpenseSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    amount: {
        type: Number,
        required: true,
     },
     startMonth: {
        type: Number,
        required: true,
     },
     startYear: {
        type: Number,
        required: true,
     },
    currentMonth: {
        type: Number,
        required: true,
     }
});


module.exports = mongoose.model('Expense', ExpenseSchema);