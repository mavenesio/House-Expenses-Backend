// @ts-nocheck
import { GraphQLModule } from '@graphql-modules/core';
import gql from 'graphql-tag';
import * as AuthUtils from '../auth/auth-utils';
import User from '../../models/User';
import UserPreference from '../../models/UserPreference';
import mongoose from 'mongoose';

export const UserModule = new GraphQLModule({
    name:'expense',
    typeDefs: gql`
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

    type Query {
        getUser(token: String!): User
    }

    type Mutation {
        addUser(input: UserInput!): User
        setUserPreference(input: UserPreferenceInput!): UserPreference
    }
  `,
    resolvers: {
        Query: {
            getUser: async (_, {token}) => {
                const userId = AuthUtils.getUserFromToken(token);
                return userId
            }
        },
        Mutation: {
            addUser: async (_, {input}, ctx) => {
                const {email, password, firstName, lastName} = input;
                try { 
                    const existingUser = await User.findOne({email});
                    if(existingUser) {throw new Error('Existing User')}
                    let cryptedPassword = await AuthUtils.hashPassword(email, 10); 
                    const user = new User({
                        firstName,
                        lastName,
                        email,
                        password: cryptedPassword,
                    });
                    await user.save(((err, user) => {
                        new UserPreference({
                            key:'Mode',
                            value:'dark',
                            userId: new mongoose.Types.ObjectId(user._id),  
                        }).save()
                    }));
                    return user;
                } catch (err) {
                    return (err);
                }
            },
            setUserPreference: async(_, {input}, ctx) => {
                const {key, value} = input;
                try {
                    let preference = await UserPreference.findOne({key: key, userId: new mongoose.Types.ObjectId(ctx.user.id)});
                    if(!preference) {throw new Error('Preference not found')}
                    const query = { $set: {value: value  } };

                    preference = await UserPreference.findOneAndUpdate(
                        {key: key, userId: new mongoose.Types.ObjectId(ctx.user.id)}, query, {new: true});
                    return preference;

                } catch (err) {
                    console.log(err);
                    return (err);
                }
            },
        }
    },
});