import { gql } from 'apollo-server-express';
import { authenticated } from '@libs/auth';
import { IContext } from '@gql/index';
import User from '@models/users';
import Restaurant from '@models/restaurants';

export const foodType = gql`
    type Food {
        id: ID
        name: String
        price: Int
        day: String
        inCart: Boolean
        quantityInCart: Int
        cartItemId: ID
        restaurantId: ID
    }
`;

export const foodResolvers = {
    Food: {
        inCart: authenticated(async (food: any, __: any, context: IContext) => {
            let user = context.currentUser;

            // get the latest user data
            user = await User.findById(user ? user.id : null);

            if (!user) {
                throw Error('User not found');
            }

            return !!user.cart.items.find((cart) => {
                return `${cart.food._id}` === `${food._id}`;
            });
        }),

        quantityInCart: authenticated(async (food: any, __: any, context: IContext) => {
            let user = context.currentUser;

            // get the latest user data
            user = await User.findById(user ? user.id : null);

            if (!user) {
                throw Error('User not found');
            }

            const cartItem = user.cart.items.find((cart) => {
                return `${cart.food._id}` === `${food._id}`;
            });

            if (!cartItem) {
                return null;
            }

            return cartItem.quantity;
        }),

        cartItemId: authenticated(async (food: any, __: any, context: IContext) => {
            let user = context.currentUser;

            // get the latest user data
            user = await User.findById(user ? user.id : null);

            if (!user) {
                throw Error('User not found');
            }

            const cartItem = user.cart.items.find((cart) => {
                return `${cart.food._id}` === `${food._id}`;
            });

            if (!cartItem) {
                return null;
            }

            return cartItem.id;
        }),

        restaurantId: authenticated(async (food: any, __: any, context: IContext) => {
            const restaurant = await Restaurant.findOne({
                menus: {
                    $elemMatch: {
                        foods: {
                            $in: food._id
                        }
                    }
                }
            });

            if (!restaurant) {
                return null;
            }

            return restaurant.id;
        })
    }
};
