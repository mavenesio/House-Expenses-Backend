const Expense = require('../models/Expense');
const User = require('../models/User');
const UserPreference = require('../models/UserPreference');
const bcrypjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
var ObjectId = require('mongoose').Types.ObjectId;
require('dotenv').config({path: 'variable.env'});

const createToken = (user, userMode, secret, expiresIn) => {
    const {id, email, firstName, lastName } = user;
    const mode = userMode.value;
    return jwt.sign({id, email, firstName, lastName, mode},secret, {expiresIn});
}

// Resolvers
const resolvers = {
    Query: {
        getExpenses: async (_, {input}, ctx) => {
            const {month, year} = input;
            console.log(input);
            const userId = new ObjectId(ctx.user.id);
            try {               
                const expenses = await Expense.find({"userId" : userId, "currentMonth" : month, "currentYear": year });
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
            console.log('month: ',startMonth, 'year: ',startYear)
            const { user } = ctx;
            try {
                const expenses = [];
                for(let i = 0; i < monthAmount; i++ ){
                    console.log('month: ', ((startMonth + i) % 12), 'year: ', startYear + Math.floor((startMonth + i) /12));
                    console.log('-----------------------')
                    const expense = new Expense(
                        {
                            name: name,
                            amount: amount,
                            type: type,
                            startMonth: startMonth,
                            startYear: startYear,
                            currentMonth: ((startMonth + i) % 12),
                            currentYear: startYear + Math.floor((startMonth + i) /12),
                            userId: new ObjectId(user.id),
                        });
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
        deleteExpense: async (_, {input}, ctx) => {
            const {expenseId, deleteType, name} = input;
            const userId = new ObjectId(ctx.user.id);
            try {
                if(ctx.user === undefined) throw new Error('User is not found.');
                let query = {userId: userId};
                if(deleteType === 'One') query = {...query, _id: ObjectId(expenseId)}
                if(deleteType === 'allNonPayments') query = {...query, name: name, paid: false}
                if(deleteType === 'All') query = {...query, name: name}
                const data = await Expense.remove(query);
                return true;                
            } catch (err) {
                console.log(err);
                return (err);
            }
        },
        updateExpense: async (_, {input}, ctx) => {
            const {expenseId, amount, paid, type} = input;
            try {
                if(amount === undefined && type === undefined && paid === undefined) throw new Error('Invalid parameters.')
                let expense = await Expense.findById(new ObjectId(expenseId));
                if(!expense) {throw new Error('Expense not found')}
                let query = { $set: {  } };
                if(amount !== undefined) query.$set = { ...query.$set, amount: amount, type: type };
                if(paid !== undefined) query.$set = {...query.$set,paid: paid };
                expense = await Expense.findOneAndUpdate(
                    {_id: new ObjectId(expenseId)}, query, {new: true});
                return expense;

            } catch (err) {
                console.log(err);
                return (err);
            }

        },
        addUser: async (_, {input}, ctx) => {
            const {email, password, firstName, lastName} = input;
            try { 
                const existingUser = await User.findOne({email});
                if(existingUser) {throw new Error('Existing User')}
                const salt = await bcrypjs.genSalt(10);
                let cryptedPassword = await bcrypjs.hash(password, salt); 
                          
                const user = new User({
                    firstName,
                    lastName,
                    email,
                    password: cryptedPassword,
                });
                await user.save(((err, user) => {
                    new UserPreference({
                        key:'Mode',
                        value:'dark',
                        userId: new ObjectId(user._id),  
                    }).save()
                }));
                return user;
            } catch (err) {
                return (err);
            }
        },
        setUserPreference: async(_, {input}, ctx) => {
            const {key, value} = input;
            try {
                let preference = await UserPreference.findOne({key: key, userId: new ObjectId(ctx.user.id)});
                if(!preference) {throw new Error('Preference not found')}
                const query = { $set: {value: value  } };

                preference = await UserPreference.findOneAndUpdate(
                    {key: key, userId: new ObjectId(ctx.user.id)}, query, {new: true});
                return preference;

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
            if(!correctPassword){ throw new Error('Incorrect password')}
            const userMode = await UserPreference.findOne({userId: new ObjectId(existingUser._id), key: 'Mode'});

            return {
                token: createToken(existingUser, userMode, process.env.SECRET, '24h'),
            }
        }
    }

}

module.exports = resolvers;
