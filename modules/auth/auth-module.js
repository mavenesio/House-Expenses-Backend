// @ts-nocheck
import { GraphQLModule } from '@graphql-modules/core';
import gql from 'graphql-tag';
const User = require('../../models/User');
const UserPreference = require('../../models/UserPreference');
const jwt = require('jsonwebtoken');
const bcrypjs = require('bcryptjs');
var ObjectId = require('mongoose').Types.ObjectId;
require('dotenv').config({path: 'variable.env'});



const HEADER_NAME = 'authorization';

const createToken = (user, userMode, secret, expiresIn) => {
  const {id, email, firstName, lastName } = user;
  const mode = userMode.value;
  return jwt.sign({id, email, firstName, lastName, mode},secret, {expiresIn});
}

export const AuthModule = new GraphQLModule({
  name: 'auth',
  typeDefs: gql`
    type LoginOutput {
        mode: String
        token: String
    }

    input AuthorizationInput {
        email: String
        password: String
    }
  type Mutation {
        userAuthorization(input: AuthorizationInput):LoginOutput 
    }
  `,
  resolvers: {
    Mutation: {
      userAuthorization: async (_, {input}, ctx) => {
        const {email, password} = input;
        const existingUser = await User.findOne({email});
        if(!existingUser) {throw new Error('User not found')};
        const correctPassword = await bcrypjs.compare(password, existingUser.password);
        if(!correctPassword){ throw new Error('Incorrect password')}
        const userMode = await UserPreference.findOne({userId: new ObjectId(existingUser._id), key: 'Mode'});
        return {
            token: createToken(existingUser, userMode, process.env.SECRET, '2h'),
        }
      }
    }
  },
  context: ({ req }) => {
    let authToken = null;
    let currentUser = null;
    try {
        authToken = req.headers[HEADER_NAME];

        if (authToken) {
                currentUser = jwt.verify(authToken.replace('Bearer ', ''), process.env.SECRET);
        }
    } catch (e) {
        console.warn(`Unable to authenticate using auth token: ${authToken}`);
    }
    return {
        authToken,
        user: currentUser,
    }
  },
})