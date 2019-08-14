import { gql } from 'apollo-server-express';
import { IRestaurant } from '@models/restaurants';

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
        locations: [String]
        menus: [Menu]
    }
`;

export const restaurantResolvers = {
    Restaurant: {
        priceRange: (restaurant: IRestaurant) => {
            if (!restaurant.menus.length) {
                return { min: 0, max: 0 };
            }

            // MAX - PRICE
            // res.menus
            //     .map((menu) =>
            //         menu.foods.reduce((acc, curr) =>
            //             acc.price > curr.price ? acc : curr
            //         )
            //     )
            //     .reduce((acc, curr) => (acc.price > curr.price ? acc : curr)).price;

            // MIN - PRICE
            // res.menus
            //     .map((menu) =>
            //         menu.foods.reduce((acc, curr) =>
            //             acc.price < curr.price ? acc : curr
            //         )
            //     )
            //     .reduce((acc, curr) => (acc.price < curr.price ? acc : curr)).price;
        }
    }
};
