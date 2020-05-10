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
    input UserPreferenceInput {
        key:String
        value: String
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
        getUser(token: String!): User
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

        userAuthorization(input: AuthorizationInput):LoginOutput 
        addUser(input: UserInput!): User

        setUserPreference(input: UserPreferenceInput!): UserPreference
    }
`;



module.exports = typeDefs;

