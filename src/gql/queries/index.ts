import { gql } from 'apollo-server-express';
import { IContext } from '@gql/index';
import { authenticated } from '@libs/auth';
import Restaurant from '@models/restaurants';

export const queryType = gql`
    type Query {
        hello: String
        user: User
        restaurants: [Restaurant]
    }
`;

export const queryResolver = {
    Query: {
        hello: () => 'world',
        user: authenticated(async function(_: any, __: any, context: IContext) {
            return context.currentUser;
        }),
        restaurants: authenticated(async function() {
            return Restaurant.find();
        })
    }
};
