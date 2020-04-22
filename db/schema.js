const { gql } = require('apollo-server');

// Schema
const typeDefs = gql`
    type User {
        id: ID
        firstName: String
        lastName: String
        email: String
    }
    type Expense {
        id: ID
        name: String
        amount: Float
        startMonth: Int
        startYear: Int
        currentMonth: Int
    }

    input UserInput {
        firstName: String
        lastName: String
        email: String
        password: String
    }

    input ExpenseInput {
        name: String!
        amount: Float!
        currentMonth: Int!
        startMonth: Int!
        startYear: Int!
    }

    input RangeExpenseInput {
        name: String!
        amount: Float!
        monthAmount: Int!
        startMonth: Int!
        startYear: Int!
    }

    type Query {
        getExpenses : [Expense]
    }

    type Mutation {
        addExpense(input: ExpenseInput!): Expense
        addRangeExpenses(input: RangeExpenseInput!): [Expense]
        addUser(input: UserInput!): User

    }
`;



module.exports = typeDefs;

