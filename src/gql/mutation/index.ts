import { gql } from 'apollo-server-express';

import * as restaurantMutation from './restaurant';
import * as userMutation from './user';

export const mutationType = gql`
    type Mutation {
        ${restaurantMutation.typeDef}
        ${userMutation.typeDef}
    }
`;

export const mutationResolvers = {
    Mutation: {
        ...restaurantMutation.resolver,
        ...userMutation.resolver
    }
};
