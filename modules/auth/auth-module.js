// @ts-nocheck
import { GraphQLModule } from '@graphql-modules/core';
import gql from 'graphql-tag';
import User from '../../models/User';
import UserPreference from '../../models/UserPreference';
import mongoose from 'mongoose';
import * as AuthUtils from './auth-utils';

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
        const correctPassword = await AuthUtils.comparePasswords(password, existingUser.password);
        if(!correctPassword){ throw new Error('Incorrect password')}
        const userMode = await UserPreference.findOne({userId: new mongoose.Types.ObjectId(existingUser._id), key: 'Mode'});
        return {
            token: AuthUtils.createToken(existingUser, userMode, '2h'),
        }
      }
    }
  },
  context: ({ req }) => {
    let authToken = null;
    let currentUser = null;
    try {
        authToken = req.headers['authorization'];

        if (authToken) {
                currentUser = AuthUtils.getUserFromToken(authToken);
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