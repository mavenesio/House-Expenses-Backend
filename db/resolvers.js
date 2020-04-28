const Expense = require('../models/Expense');
const User = require('../models/User');
const bcrypjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
var ObjectId = require('mongoose').Types.ObjectId;
require('dotenv').config({path: 'variable.env'});

const createToken = (user, secret, expiresIn) => {
    const {id, email, firstName, lastName } = user;
    return jwt.sign({id, email, firstName, lastName},secret, {expiresIn});
}

// Resolvers
const resolvers = {
    Query: {
        getExpenses: async (_, {input}, ctx) => {
            const userId = new ObjectId(ctx.user.id);
            const now = new Date();
            try {               
                const expenses = await Expense.find({"userId" : userId, "currentMonth" : now.getMonth(), "currentYear": now.getFullYear() });
                return expenses;
            } catch (err) {
                console.log(err);
                return (err);
            }
        },
        getUser: async (_, {token}) => {
            const userId = await jwt.verify(token, process.env.SECRET);
            return userId
        }
    },
    Mutation: {
        addRangeExpenses: async (_, {input}, ctx) => {
            const {monthAmount, name, amount, startMonth, startYear, type} = input;
            const { user } = ctx;
            try {
                const expenses = [];
                for(let i = 0; i < monthAmount; i++ ){
                    const expense = new Expense(
                        {
                            name: name,
                            amount: amount,
                            type: type,
                            startMonth: startMonth,
                            startYear: startYear,
                            currentMonth: ((startMonth + i) % 11),
                            currentYear: (startMonth + i > 11) ? startYear+1 : startYear,
                            userId: new ObjectId(ctx.user.id) 
                        }
                        );
                    expense.save();
                    expenses.push(expense);
                }
                // @ts-ignore
                return expenses.find(expense => expense.currentMonth === startMonth);
            } catch (err) {
                console.log(err);
                return (err);
            }
        },
        payExpense: async (_, {input}, ctx) => {
            const {expenseId, paid} = input;
            try {
                let expense = await Expense.findById(new ObjectId(expenseId));
                if(!expense) {throw new Error('Expense not found')}
                expense = await Expense.findOneAndUpdate({_id: new ObjectId(expenseId)}, { $set: { paid: paid } }, {new: true});
                return expense;
            } catch (err) {
                console.log(err);
                return (err);
            }

        },
        updateExpense: async (_, {input}, ctx) => {
            const {expenseId, amount} = input;
            try {
                let expense = await Expense.findById(new ObjectId(expenseId));
                if(!expense) {throw new Error('Expense not found')}
                expense = await Expense.findOneAndUpdate({_id: new ObjectId(expenseId)}, { $set: { amount: amount } }, {new: true});
                return expense;

            } catch (err) {
                console.log(err);
                return (err);
            }

        },
        addUser: async (_, {input}, ctx) => {
            const {email, password} = input;
            try { 
                const existingUser = await User.findOne({email});
                if(existingUser) {throw new Error('Existing User')}
                const salt = await bcrypjs.genSalt(10);
                input.password = await bcrypjs.hash(password, salt); 
                          
                const user = new User(input);
                user.save();
                return user;
            } catch (err) {
                console.log(err);
                return (err);
            }
        },
        userAuthorization: async (_, {input}, ctx) => {
            const {email, password} = input;

            const existingUser = await User.findOne({email});
            if(!existingUser) {throw new Error('User not found')};
            // @ts-ignore
            const correctPassword = await bcrypjs.compare(password, existingUser.password);
            if(!correctPassword){
                throw new Error('Incorrect password');
            }

            return {
                token: createToken(existingUser, process.env.SECRET, '24h')
            }
        }
    }

}

module.exports = resolvers;
