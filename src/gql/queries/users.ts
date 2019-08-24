import { gql } from 'apollo-server-express';
import { IUser } from '@models/users';

export const userType = gql`
    type CartItem {
        id: ID
        food: Food
        quantity: Int
    }

    type Cart {
        id: ID
        totalAmount: Int
        items: [CartItem]
    }

    type Order {
        id: ID
        date: String
        meals: [Food]
    }

    type User {
        id: ID
        username: String
        email: String
        location: String
        favouriteRestaurants: [Restaurant]
        cart: Cart
        orders: [Order]
    }
`;

export const userResolvers = {
    User: {
        favouriteRestaurants: async (user: IUser) => {
            const withFavRestaurant = await user.populate('favourite_restaurants').execPopulate();

            return withFavRestaurant.favourite_restaurants;
        },

        cart: async (user: IUser) => {
            const withCart = await user.populate('cart.items.food').execPopulate();

            return withCart.cart;
        }
    }
};
