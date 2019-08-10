import { gql } from 'apollo-server-express';

export const userType = gql`
    type Cart {
        food: Food
        quantity: Int
    }

    type Order {
        date: String
        meals: [Food]
    }

    type User {
        id: ID
        username: String
        email: String
        location: String
        favourite_restaurants: [Restaurant]
        cart: [Cart]
        orders: [Order]
    }
`;

export const userResolvers = {
    User: {}
};
