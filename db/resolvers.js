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
            const currentMonth = (new Date()).getMonth();
            try {               
                const expenses = await Expense.find({"userId" : userId, "currentMonth" : currentMonth+1 });
                console.log('Get expenses: ',expenses.length);
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
            const { user } = ctx;
            try {
                const expenses = [];
                for(let i = 0; i < monthAmount; i++ ){
                    const expense = new Expense(
                        {
                            name: name,
                            amount: amount,
                            startMonth: startMonth,
                            startYear: startYear,
                            currentMonth: (startMonth + i) % 12,
                            userId: new ObjectId(ctx.user.id) 
                        }
                        );
                    expense.save();
                    expenses.push(expense);
                }
                console.log('Get expenses: ',expenses.length);
                return expenses;
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
