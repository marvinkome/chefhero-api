import { gql } from 'apollo-server-express';
import { IContext } from '@gql/index';
import { authenticated } from '@libs/auth';
import Restaurant from '@models/restaurants';

export const queryType = gql`
    type Query {
        hello: String

        user: User
        restaurants: [Restaurant]

        favouriteRestaurants: [Restaurant]
        recommendedRestaurants: [Restaurant]
    }
`;

export const queryResolver = {
    Query: {
        hello: () => 'world',

        user: authenticated(async function(_: any, __: any, context: IContext) {
            return context.currentUser;
        }),

        restaurants: authenticated(async function() {
            return Restaurant.find();
        }),

        favouriteRestaurants: authenticated(async function(_: any, __: any, context: IContext) {
            const user = context.currentUser;
            if (!user) {
                throw Error('User not found');
            }

            const withFavRestaurant = await user.populate('favourite_restaurants').execPopulate();

            return withFavRestaurant.favourite_restaurants;
        }),

        recommendedRestaurants: authenticated(async function(_: any, __: any, context: IContext) {
            // we're only using recommedation based on location
            const user = context.currentUser;
            if (!user) {
                throw Error('User not found');
            }

            const userLocation = user.location;

            return await Restaurant.find({
                locations: { $in: [userLocation] }
            });
        })
    }
};
