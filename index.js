const { ApolloServer} = require('apollo-server');
const typeDefs = require('./db/schema');
const resolvers = require('./db/resolvers');
const connectDB = require('./config/db');


connectDB();


//server
const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: () => {
        const ctx = {
            token: '123'
        }
        return ctx
    }

});



// run server

server.listen().then(
    ({url}) => {

        console.log(`server ready in URL ${url}`);        
    }
)