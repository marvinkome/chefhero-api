import moment from 'moment';
import { authenticated } from '@libs/auth';
import Restaurant from '@models/restaurants';
import Food from '@models/foods';

export const typeDef = `
    """CUD for restaurants"""
    createRestaurant(name: String!): Restaurant
    updateRestaurant(id: ID!, name: String): Restaurant
    deleteRestaurant(id: ID!): Boolean

    addSupportedLocations(id: ID!, location: String): Restaurant

    """CUD for menus"""
    createWeeklyMenu(id: ID!, startDate: String!, endDate: String!): Restaurant
    updateWeeklyMenu(menuId: ID!, startDate: String!, endDate: String!): Restaurant
    removeWeeklyMenu(id: ID!, menuId: ID!): Boolean

    createFood(name: String!, price: Int!, day: String!, menuId: ID!): Restaurant
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
            start_date: moment(data.startDate, 'DD-MM-YYYY').format('DD-MM-YYYY'),
            end_date: moment(data.endDate, 'DD-MM-YYYY').format('DD-MM-YYYY'),
            foods: []
        });

        return restaurant.save();
    }),

    updateWeeklyMenu: authenticated(async (_: any, data: any) => {
        const { menuId, ...updateData } = data;
        const update: any = {};

        if (updateData.startDate) {
            update['menus.$.start_date'] = moment(updateData.startDate, 'DD-MM-YYYY').format(
                'DD-MM-YYYY'
            );
        }

        if (updateData.endDate) {
            update['menus.$.end_date'] = moment(updateData.endDate, 'DD-MM-YYYY').format(
                'DD-MM-YYYY'
            );
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
        return Restaurant.findByIdAndUpdate(
            id,
            {
                $pull: { menus: { _id: menuId } }
            },
            { new: true }
        );
    }),

    createFood: authenticated(async (_: any, data) => {
        // create food data
        const food = new Food({
            name: data.name,
            price: data.price,
            day: data.day
        });

        await food.save();

        // add food to restaurant menu
        const restaurant = await Restaurant.findOneAndUpdate(
            { 'menus._id': data.menuId },
            {
                $push: {
                    'menus.$.foods': food.id
                }
            },
            { new: true }
        );

        return restaurant ? restaurant.populate('menus.foods').execPopulate() : null;
    })
};
