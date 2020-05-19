// @ts-nocheck
import { GraphQLModule } from '@graphql-modules/core';
import {AuthModule} from '../auth/auth-module';
import gql from 'graphql-tag';
import Expense from '../../models/Expense';
import mongoose from 'mongoose';
import {isEqual, formatISO} from 'date-fns';

export const ExpenseModule = new GraphQLModule({
    name:'expense',
    imports: [AuthModule],
    typeDefs: gql`
        type Expense {
            id: ID
            name: String
            type: String
            amount: Float
            currentDate: String
            startMonth: Int
            startYear: Int
            currentMonth: Int
            currentYear: Int
            paid:Boolean
        }
        type ExpenseNames {
            name: String
        }
        input GetExpensesInput {
            month: Int!,
            year: Int!
        }
        input ExpenseInput {
            name: String!
            type: String!
            amount: Float!
            currentMonth: Int!
            startMonth: Int!
            startYear: Int!
        }
        input RangeExpenseInput {
            name: String!
            type: String!
            amount: Float!
            monthAmount: Int!
            startMonth: Int!
            startYear: Int!
        }
        input DeleteExpenseInput {
            expenseId: ID!
            deleteType: String!
            name: String!
        }
        input getExpenseDataInput {
            name: String!
        }
        type DeleteExpenseOutput {
            success: Boolean
        }
        input UpdateExpenseInput {
            expenseId: ID!
            amount: Float
            paid: Boolean
            type: String
        }
        input UpdateExpenseNameInput {
            newName: String!
            oldName: String!
        }
        input getExpenseReportInput {
            names: [String]!
        }

        type Query {
            getExpenses(input: GetExpensesInput!) : [Expense]
            getAllExpenses: [ExpenseNames]
            getExpenseData(input: getExpenseDataInput): [Expense]

            getExpenseReport(input: getExpenseReportInput ): [[String]]
        }

        type Mutation {
            addRangeExpenses(input: RangeExpenseInput!) : Expense
            updateExpense(input: UpdateExpenseInput!): Expense
            updateExpenseName(input: UpdateExpenseNameInput!): Expense
            deleteExpense(input: DeleteExpenseInput!): DeleteExpenseOutput
        }
    `,
    resolvers: {
        Query: {
            getExpenses: async (_, {input}, ctx) => {
                const {month, year} = input;
                const userId = new mongoose.Types.ObjectId(ctx.user.id);
                try {               
                    const expenses = await Expense.find({"userId" : userId, "currentMonth" : month, "currentYear": year });
                    return expenses;
                } catch (err) {
                    console.log(err);
                    return (err);
                }
            }, 
            getAllExpenses: async (root, {}, {user}) => {
                const userId = new mongoose.Types.ObjectId(user.id);
                try {               
                    const expenses = await Expense.find({"userId" : userId})
                                                  .distinct("name", (error, results) => results);
                    return expenses.map(value => {return ({name: value})});
                } catch (err) {
                    console.log(err);
                    return (err);
                }
            },
            getExpenseData: async (_, {input}, ctx) => {
                const {name} = input;
                const userId = new mongoose.Types.ObjectId(ctx.user.id);
                try {               
                    const expenses = await Expense.find({"userId" : userId, "name" : name}).sort( { currentYear:1 } ).sort({currentMonth: 1,});
                    return expenses;
                } catch (err) {
                    console.log(err);
                    return (err);
                }
            },
            
        },
        Mutation: {
            addRangeExpenses: async (_, {input}, ctx) => {
                const {monthAmount, name, amount, startMonth, startYear, type} = input;
                const { user } = ctx;
                try {
                        let currentExpense;
                        const now = new Date();
                        const today = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
                    for(let i = 0; i < monthAmount; i++ ){
                        const currentDate = new Date(`${startYear + Math.floor((startMonth + i) / 12)}-${(((startMonth + i) % 12) + 1)}-1`);
                        const expense = new Expense(
                            {
                                name: name,
                                amount: amount,
                                type: type,
                                currentDate: formatISO(currentDate, []),
                                paid: currentDate.getTime() < today.getTime(),
                                userId: new mongoose.Types.ObjectId(user.id),
                            });
                        expense.save();
                        if(isEqual(currentDate, today)) currentExpense = expense;
                    }
                    console.log(currentExpense);
                    return currentExpense;
                } catch (err) {
                    console.log(err);
                    return (err);
                }
            },
            deleteExpense: async (_, {input}, ctx) => {
                const {expenseId, deleteType, name} = input;
                const userId = new mongoose.Types.ObjectId(ctx.user.id);
                try {
                    if(ctx.user === undefined) throw new Error('User is not found.');
                    let query = {userId: userId};
                    if(deleteType === 'One') query = {...query, _id: mongoose.Types.ObjectId(expenseId)}
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
                    let expense = await Expense.findById(new mongoose.Types.ObjectId(expenseId));
                    if(!expense) {throw new Error('Expense not found')}
                    let query = { $set: {  } };
                    if(amount !== undefined) query.$set = { ...query.$set, amount: amount, type: type };
                    if(paid !== undefined) query.$set = {...query.$set,paid: paid };
                    expense = await Expense.findOneAndUpdate(
                        {_id: new mongoose.Types.ObjectId(expenseId)}, query, {new: true});
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
                        {userId: new mongoose.Types.ObjectId(user.id), name: oldName}, query, {new: true});
                    return expense;
                } catch (err) {
                    console.log(err);
                    return (err);
                }

            }
        }
    },
});