import { authenticated } from '@libs/auth';
import { IContext } from '@gql/index';
import User from '@models/users';
import Restaurant from '@models/restaurants';

export const typeDef = `
    updateProfile(location: String, email: String): User
    addToFavourite(id: ID!): User
    addToCart(foodId: ID!): User
    updateItemInCart(cartId: ID!, quantity: Int): User
    removeItemFromCart(cartId: ID!): User
`;

export const resolver = {
    updateProfile: authenticated(async (_: any, data: any, context: IContext) => {
        const { currentUser } = context;
        if (!currentUser) {
            throw Error('User not found');
        }

        if (data.location) {
            currentUser.location = data.location;
        }

        if (data.email) {
            currentUser.email = data.email;
        }

        return currentUser.save();
    }),

    addToFavourite: authenticated(async (_: any, data: any, context: IContext) => {
        const restaurant = await Restaurant.findById(data.id);
        const user = context.currentUser;

        if (!restaurant) {
            throw Error('Restaurant not found');
        }

        if (!user) {
            throw Error('User not found');
        }

        try {
            user.favourite_restaurants.push(restaurant);
            await user.save();
            return true;
        } catch (e) {
            console.warn(e);
            return false;
        }
    }),

    addToCart: authenticated(async (_: any, data: any, context: IContext) => {
        const user = context.currentUser;

        if (!user) {
            throw Error('User not found');
        }

        user.cart.push({
            food: data.foodId,
            quantity: 1
        });

        return user.save();
    }),

    updateItemInCart: authenticated(async (_: any, data: any, context: IContext) => {
        const user = context.currentUser;

        if (!user) {
            throw Error('User not found');
        }

        return await User.findOneAndUpdate(
            { 'cart._id': data.cartId },
            {
                $set: {
                    'cart.$.quantity': data.quantity
                }
            },
            { new: true }
        );
    }),

    removeItemFromCart: authenticated(async (_: any, data: any, context: IContext) => {
        let user = context.currentUser;

        if (!user) {
            throw Error('User not found');
        }

        user = await User.findByIdAndUpdate(
            user.id,
            {
                $pull: { cart: { _id: data.cartId } }
            },
            { new: true }
        );

        return user;
    })
};
