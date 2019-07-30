import { gql } from 'apollo-server-express';

import * as restaurantMutation from './restaurant';

export const mutationType = gql`
    type Mutation {
        ${restaurantMutation.typeDef}
    }
`;

export const mutationResolvers = {
    Mutation: {
        ...restaurantMutation.resolver
    }
};
