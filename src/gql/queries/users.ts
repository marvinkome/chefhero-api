import { gql } from 'apollo-server-express';
import { IUser } from '@models/users';

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
        favouriteRestaurants: [Restaurant]
        cart: [Cart]
        orders: [Order]
    }
`;

export const userResolvers = {
    User: {
        favouriteRestaurants: async (user: IUser) => {
            const withFavRestaurant = await user.populate('favourite_restaurants').execPopulate();

            return withFavRestaurant.favourite_restaurants;
        }
    }
};
