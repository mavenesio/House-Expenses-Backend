const { ApolloServer} = require('apollo-server');
const typeDefs = require('./db/schema');
const resolvers = require('./db/resolvers');
const jwt = require('jsonwebtoken');
const connectDB = require('./config/db');


connectDB();


//server
const server = new ApolloServer({
    typeDefs,
    resolvers,
    cors: {
      origin: "*",
      methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
      preflightContinue: false,
      optionsSuccessStatus: 204,
      credentials: true
    },
    context: ({req}) => {
        const token = req.headers['authorization'] || '';
        if(token){
            try {
                const user = jwt.verify(token.replace('Bearer ', ''), process.env.SECRET);
                return {
                    user
                }
            } catch (err) {
                console.log(err);
            }
        }
        const ctx = {
            token: '123'
        }
        return ctx
    }

});

// run server

server.listen({port: process.env.PORT || 4000}).then(
    ({url}) => {

        console.log(`server ready in URL ${url}`);        
    }
)