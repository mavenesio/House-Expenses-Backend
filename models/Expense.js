const mongoose = require('mongoose');
var ObjectId = require('mongoose').Types.ObjectId;


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
     },
     userId:{
        type:ObjectId,
        required:true,
     },
     created:{
         type:Date,
         default: Date.now(),
     }
});


module.exports = mongoose.model('Expense', ExpenseSchema);