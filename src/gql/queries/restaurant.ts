import moment from 'moment';
import { gql } from 'apollo-server-express';
import { IRestaurant } from '@models/restaurants';
import { authenticated } from '@libs/auth';
import { IContext } from '@gql/index';

export const restaurantType = gql`
    type Menu {
        id: ID
        start_date: String
        end_date: String
        foods: [Food]
    }

    type PriceRange {
        min: Int
        max: Int
    }

    type Restaurant {
        id: ID
        name: String
        averageRatings: Int
        priceRange: PriceRange
        activeMenu: Menu
        isFavourite: Boolean
        locations: [String]
        menus: [Menu]
    }
`;

export const restaurantResolvers = {
    Restaurant: {
        priceRange: async (restaurant: IRestaurant) => {
            restaurant = await restaurant.populate('menus.foods').execPopulate();
            if (!restaurant.menus.length) {
                return { min: 0, max: 0 };
            }

            // MAX - PRICE
            const maxPrice = restaurant.menus
                .map((menu) => {
                    if (!menu.foods.length) {
                        return { price: 0 };
                    }
                    return menu.foods.reduce((a, c) => (a.price > c.price ? a : c));
                })
                .reduce((acc, curr) => (acc.price > curr.price ? acc : curr)).price;

            // MIN - PRICE
            const minPrice = restaurant.menus
                .map((menu) => {
                    if (!menu.foods.length) {
                        return { price: 0 };
                    }
                    return menu.foods.reduce((a, c) => (a.price < c.price ? a : c));
                })
                .reduce((acc, curr) => (acc.price < curr.price ? acc : curr)).price;

            return {
                min: minPrice,
                max: maxPrice
            };
        },

        activeMenu: async (restaurant: IRestaurant) => {
            restaurant = await restaurant.populate('menus.foods').execPopulate();
            const activeMenu = restaurant.menus.filter((menu) => {
                const startOfWeek = moment()
                    .startOf('isoWeek')
                    .format('DD-MM-YYYY');
                return menu.start_date === startOfWeek;
            })[0];

            return activeMenu;
        },

        isFavourite: authenticated((restaurant: IRestaurant, _: any, context: IContext) => {
            const user = context.currentUser;
            if (!user) {
                throw Error('User not found');
            }

            return !!user.favourite_restaurants.find((res: IRestaurant) => {
                return `${res._id}` === `${restaurant._id}`;
            });
        }),

        menus: async (restaurant: IRestaurant) => {
            return (await restaurant.populate('menus.foods').execPopulate()).menus;
        }
    }
};
