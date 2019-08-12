import { authenticated } from '@libs/auth';
import { IContext } from '@gql/index';
import Restaurant from '@models/restaurants';

export const typeDef = `
    updateProfile(location: String, email: String): User
    addToFavourite(id: ID!): User
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
    })
};
