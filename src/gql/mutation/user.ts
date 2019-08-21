import { authenticated } from '@libs/auth';
import { IContext } from '@gql/index';
import User from '@models/users';
import Restaurant from '@models/restaurants';
import Food from '@models/foods';

export const typeDef = `
    updateProfile(location: String, email: String): User
    addToFavourite(id: ID!): User
    addToCart(foodId: ID!): Cart
    increaseCartItem(cartItemId: ID!): Cart
    decreaseCartItem(cartItemId: ID!): Cart
    removeCartItem(cartItemId: ID!): Cart
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

        const food = await Food.findById(data.foodId);
        if (!food) {
            throw Error('Food not found');
        }

        user.cart.items.push({
            food: food.id,
            quantity: 1
        });
        user.cart.totalAmount = (user.cart.totalAmount || 0) + food.price;

        await user.save();
        return (await user.populate('cart.items.food').execPopulate()).cart;
    }),

    increaseCartItem: authenticated(async (_: any, data: any, context: IContext) => {
        let user = context.currentUser;

        if (!user) {
            throw Error('User not found');
        }

        // populate foods
        user = await user.populate('cart.items.food').execPopulate();

        // get cart items
        const cartItem = user.cart.items.find((item) => {
            return data.cartItemId === `${item.id}`;
        });

        if (!cartItem) {
            throw Error('Cart item not found');
        }

        // increase item quantity
        user = await User.findOneAndUpdate(
            {
                'cart.items._id': data.cartItemId
            },
            {
                $set: {
                    'cart.totalAmount': (user.cart.totalAmount || 0) + cartItem.food.price
                },
                $inc: {
                    'cart.items.$.quantity': 1
                }
            },
            { new: true }
        );

        if (!user) {
            throw Error('User not found');
        }

        return (await user.populate('cart.items.food').execPopulate()).cart;
    }),

    decreaseCartItem: authenticated(async (_: any, data: any, context: IContext) => {
        let user = context.currentUser;

        if (!user) {
            throw Error('User not found');
        }

        // populate foods
        user = await user.populate('cart.items.food').execPopulate();

        // get cart items
        const cartItem = user.cart.items.find((item) => {
            return data.cartItemId === `${item.id}`;
        });

        if (!cartItem) {
            throw Error('Cart item not found');
        }

        const updateObj: any = {
            $set: {
                'cart.totalAmount': (user.cart.totalAmount || 0) - cartItem.food.price
            }
        };

        if (cartItem.quantity === 1) {
            // then fully remove item
            updateObj.$pull = {
                'cart.items': {
                    _id: data.cartItemId
                }
            };
        } else {
            updateObj.$inc = {
                'cart.items.$.quantity': -1
            };
        }

        // increase item quantity
        user = await User.findOneAndUpdate(
            {
                'cart.items._id': data.cartItemId
            },
            updateObj,
            { new: true }
        );

        if (!user) {
            throw Error('User not found');
        }

        return (await user.populate('cart.items.food').execPopulate()).cart;
    }),

    removeCartItem: authenticated(async (_: any, data: any, context: IContext) => {
        let user = context.currentUser;

        if (!user) {
            throw Error('User not found');
        }

        // populate foods
        user = await user.populate('cart.items.food').execPopulate();

        // get cart items
        const cartItem = user.cart.items.find((item) => {
            return data.cartItemId === `${item.id}`;
        });

        if (!cartItem) {
            throw Error('Cart item not found');
        }

        const totalPriceOfItem = cartItem.food.price * cartItem.quantity;

        user = await User.findOneAndUpdate(
            {
                'cart.items._id': data.cartItemId
            },
            {
                $set: {
                    'cart.totalAmount': (user.cart.totalAmount || 0) - totalPriceOfItem
                },
                $pull: {
                    'cart.items': {
                        _id: data.cartItemId
                    }
                }
            },
            {
                new: true
            }
        );

        if (!user) {
            throw Error('User not found');
        }

        return (await user.populate('cart.items.food').execPopulate()).cart;
    })
};
