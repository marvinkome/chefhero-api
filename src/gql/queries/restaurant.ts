import { gql } from 'apollo-server-express';

export const restaurantType = gql`
    type Menu {
        start_date: String
        end_date: String
        foods: [Food]
    }

    type Restaurant {
        id: ID!
        name: String!
        averageRatings: Int
        menus: [Menu]
    }
`;

export const restaurantResolvers = {
    Restaurant: {}
};
