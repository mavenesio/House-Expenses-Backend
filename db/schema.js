const { gql } = require('apollo-server');

// Schema
const typeDefs = gql`
    # USERS
    type User {
        id: ID
        firstName: String
        lastName: String
        email: String
    }
    input UserInput {
        firstName: String
        lastName: String
        email: String
        password: String
    }

    # AUTHORIZATION

    type Token {
        token: String
    }
    input AuthorizationInput {
        email: String
        password: String
    }


    #EXPENSES
    type Expense {
        id: ID
        name: String
        amount: Float
        startMonth: Int
        startYear: Int
        currentMonth: Int
        currentYear: Int
        paid:Boolean
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

    input payExpenseInput {
        expenseId: ID!
        paid: Boolean!
    }
    input updateExpenseInput {
        expenseId: ID!
        amount: Int!
    }

    type Query {
        getExpenses : [Expense]
        getUser(token: String!): User
    }

    type Mutation {
        addRangeExpenses(input: RangeExpenseInput!) : Expense
        payExpense(input: payExpenseInput!): Expense
        updateExpense(input: updateExpenseInput!): Expense

        userAuthorization(input: AuthorizationInput):Token 
        addUser(input: UserInput!): User

    }
`;



module.exports = typeDefs;

