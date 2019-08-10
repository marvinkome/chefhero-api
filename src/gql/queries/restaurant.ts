import { gql } from 'apollo-server-express';

export const restaurantType = gql`
    type Restaurant {
        id: ID!
        name: String!
        averageRatings: Int
    }
`;

export const restaurantResolvers = {
    Restaurant: {}
};
