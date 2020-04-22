const Expense = require('../models/Expense');
const User = require('../models/User');
const bcrypjs = require('bcryptjs');

// Resolvers
const resolvers = {
    Query: {
        getExpenses: async () => {
            try {               
                const expenses = await Expense.find();
                return expenses;
            } catch (err) {
                console.log(err);
                return (err);
            }
        }
    },
    Mutation: {
        addExpense: async (_, {input}, ctx) => {
            try {
                const expense = new Expense(input);
                expense.save();
                return expense;
            } catch (err) {
                console.log(err);
                return (err);
            }
        },
        addRangeExpenses: async (_, {input}, ctx) => {
            const {monthAmount, name, amount, startMonth, startYear} = input;
            console.log(input);
            try {
                const expenses = [];
                for(let i = 0; i < monthAmount; i++ ){
                    const expense = new Expense(
                        {
                            name: name,
                            amount: amount,
                            startMonth: startMonth,
                            startYear: startYear,
                            currentMonth: i,
                            user: 1,
                        }
                        );
                    expense.save();
                    expenses.push(expense);
                }
                return expenses;
            } catch (err) {
                console.log(err);
                return (err);
            }
        },
        addUser: async (_, {input}, ctx) => {
            const {email, password} = input;

            const existingUser = await User.findOne({email});
            if(existingUser) {
                throw new Error('Existing User')}

            const salt = await bcrypjs.genSalt(10);
            input.password = await bcrypjs.hash(password, salt); 
            
            try {               
                const user = new User(input);
                user.save();
                return user;
            } catch (err) {
                console.log(err);
                return (err);
            }
        }
    }

}

module.exports = resolvers;
