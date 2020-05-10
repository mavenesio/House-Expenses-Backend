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
            const userId = new ObjectId(ctx.user.id);
            try {               
                const expenses = await Expense.find({"userId" : userId, "currentMonth" : month, "currentYear": year });
                return expenses;
            } catch (err) {
                console.log(err);
                return (err);
            }
        },
        getAllExpenses: async (_, {input}, ctx) => {
            const userId = new ObjectId(ctx.user.id);
            try {               
                const expenses = await Expense.find({"userId" : userId})
                                              // @ts-ignore
                                              .distinct("name", (error, results) => results);
                return expenses.map(value => {return ({name: value})});
            } catch (err) {
                console.log(err);
                return (err);
            }
        },
        getExpenseData: async (_, {input}, ctx) => {
            const {name} = input;
            const userId = new ObjectId(ctx.user.id);
            try {               
                const expenses = await Expense.find({"userId" : userId, "name" : name}).sort( { currentYear:1 } ).sort({currentMonth: 1,});
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
                            currentMonth: ((startMonth + i) % 12),
                            currentYear: startYear + Math.floor((startMonth + i) /12),
                            userId: new ObjectId(user.id),
                        });
                    expense.save();
                    expenses.push(expense);
                }
                const now = new Date();
                // @ts-ignore
                const currentExpense = expenses.find(expense => expense.currentMonth == now.getMonth() && expense.currentYear == now.getFullYear());
                return currentExpense;
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
                // @ts-ignore
                const data = await Expense.remove(query);
                return true;                
            } catch (err) {
                console.log(err);
                return (err);
            }
        },
        // @ts-ignore
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
        updateExpenseName: async (_, {input}, ctx) => {
            const {oldName, newName} = input;
            const { user } = ctx;
            try {
                let query = { $set: { name: newName } };
                const expense = await Expense.updateMany(
                    {userId: new ObjectId(user.id), name: oldName}, query, {new: true});
                return expense;
            } catch (err) {
                console.log(err);
                return (err);
            }

        },
        // @ts-ignore
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
                // @ts-ignore
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
            console.log('2')

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
