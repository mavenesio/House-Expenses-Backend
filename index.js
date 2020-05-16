const { ApolloServer} = require('apollo-server');
const connectDB = require('./config/db');

import { GraphQLModule } from '@graphql-modules/core';
import { UserModule } from './modules/user/user-module';
import { ExpenseModule } from './modules/expense/expense-module';
import { AuthModule } from './modules/auth/auth-module';

export const appModule = new GraphQLModule({
    imports: [
      AuthModule,
      UserModule,
      ExpenseModule,
    ],
  });
  
  const { schema, context } = appModule;

connectDB();


//server
const server = new ApolloServer({
    schema,
    cors: {
      origin: "*",
      methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
      preflightContinue: false,
      optionsSuccessStatus: 204,
      credentials: true
    },
    context
 });

// run server

server.listen({port: process.env.PORT || 4000}).then(
    ({url}) => {
        console.log(`server ready in URL ${url}`);    
        console.log(`Environment: ${process.env.NODE_ENV}`)    
    }
)