import moment from 'moment';
import { authenticated } from '@libs/auth';
import Restaurant from '@models/restaurants';

export const typeDef = `
    createRestaurant(name: String!): Restaurant
    updateRestaurant(id: ID!, name: String): Restaurant
    deleteRestaurant(id: ID!): Boolean
    addSupportedLocations(id: ID!, location: String): Restaurant
    createWeeklyMenu(id: ID!, startDate: String!, endDate: String!): Restaurant
    updateWeeklyMenu(menuId: ID!, startDate: String!, endDate: String!): Restaurant
    removeWeeklyMenu(id: ID!, menuId: ID!): Boolean
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
    }),

    createWeeklyMenu: authenticated(async (_: any, data: any) => {
        const { id } = data;
        const restaurant = await Restaurant.findById(id);

        if (!restaurant) {
            throw Error('Restaurant not found');
        }

        restaurant.menus.push({
            start_date: moment(data.startDate, 'DD-MM-YYYY').toString(),
            end_date: moment(data.endDate, 'DD-MM-YYYY').toString(),
            foods: []
        });

        return restaurant.save();
    }),

    updateWeeklyMenu: authenticated(async (_: any, data: any) => {
        const { menuId, ...updateData } = data;
        const update: any = {};

        if (updateData.startDate) {
            update['menus.$.start_date'] = moment(updateData.startDate, 'DD-MM-YYYY').toString();
        }

        if (updateData.endDate) {
            update['menus.$.end_date'] = moment(updateData.endDate, 'DD-MM-YYYY').toString();
        }

        const restaurant = await Restaurant.findOneAndUpdate(
            { 'menus._id': menuId },
            { $set: update },
            { new: true }
        );

        return restaurant;
    }),

    removeWeeklyMenu: authenticated(async (_: any, data: any) => {
        const { menuId, id } = data;
        try {
            await Restaurant.findByIdAndUpdate(
                id,
                {
                    $pull: { menus: { _id: menuId } }
                },
                { new: true }
            );

            return true;
        } catch (e) {
            throw Error(e);
        }
    })
};
