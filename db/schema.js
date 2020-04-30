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
    type UserPreference {
        id: ID
        key:String
        value:String
        userId: ID
    }
    input UserInput {
        firstName: String
        lastName: String
        email: String
        password: String
    }

    # AUTHORIZATION

    type LoginOutput {
        mode: String
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
        type: String
        amount: Float
        startMonth: Int
        startYear: Int
        currentMonth: Int
        currentYear: Int
        paid:Boolean
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
    type DeleteExpenseOutput {
        success: Boolean
    }

    input UpdateExpenseInput {
        expenseId: ID!
        amount: Float
        paid: Boolean
        type: String
    }
    input UserPreferenceInput {
        key:String
        value: String
    }

    type Query {
        getExpenses(input: GetExpensesInput!) : [Expense]
        getUser(token: String!): User
    }

    type Mutation {
        addRangeExpenses(input: RangeExpenseInput!) : Expense
        updateExpense(input: UpdateExpenseInput!): Expense
        deleteExpense(input: DeleteExpenseInput!): DeleteExpenseOutput

        userAuthorization(input: AuthorizationInput):LoginOutput 
        addUser(input: UserInput!): User

        setUserPreference(input: UserPreferenceInput!): UserPreference
    }
`;



module.exports = typeDefs;

