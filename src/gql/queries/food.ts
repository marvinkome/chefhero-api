import { gql } from 'apollo-server-express';
import { authenticated } from '@libs/auth';
import { IContext } from '@gql/index';

export const foodType = gql`
    type Food {
        id: ID
        name: String
        price: Int
        day: String
        inCart: Boolean
    }
`;

export const foodResolvers = {
    Food: {
        inCart: authenticated(async (food: any, __: any, context: IContext) => {
            const user = context.currentUser;
            if (!user) {
                throw Error('User not found');
            }

            return !!user.cart.find((cart) => {
                return `${cart.food._id}` === `${food._id}`;
            });
        })
    }
};
