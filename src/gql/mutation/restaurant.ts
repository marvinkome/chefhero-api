import { authenticated } from '@libs/auth';
import Restaurant from '@models/restaurants';

export const typeDef = `
    createRestaurant(name: String!): Restaurant
    updateRestaurant(id: ID!, name: String): Restaurant
    deleteRestaurant(id: ID!): Boolean
    addSupportedLocations(id: ID!, location: String): Restaurant
`;

export const resolver = {
    createRestaurant: authenticated(async (_: any, data: any) => {
        const restaurant = new Restaurant(data);
        return restaurant.save();
    }),

    updateRestaurant: authenticated(async (_: any, data: any) => {
        const { id, ...update } = data;
        const restaurant = await Restaurant.findByIdAndUpdate(id, update, {
            new: true
        });

        return restaurant;
    }),

    deleteRestaurant: authenticated(async (_: any, data: any) => {
        const restaurant = await Restaurant.findById(data.id);

        if (!restaurant) {
            throw Error('Restaurant not found');
        }

        try {
            await restaurant.remove();
            return true;
        } catch (e) {
            return false;
        }
    }),

    addSupportedLocations: authenticated(async (_: any, data: any) => {
        const { id, location } = data;
        const restaurant = await Restaurant.findById(id);

        if (!restaurant) {
            throw Error('Restaurant not found');
        }

        // todo add validation
        restaurant.locations.push(location);
        return restaurant.save();
    })
};
