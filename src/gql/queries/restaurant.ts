import { gql } from 'apollo-server-express';

export const restaurantType = gql`
    type Restaurant {
        id: ID!
        name: String!
    }
`;

export const restaurantResolvers = {
    Restaurant: {}
};
