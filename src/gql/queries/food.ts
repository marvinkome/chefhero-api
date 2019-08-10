import { gql } from 'apollo-server-express';

export const foodType = gql`
    type Food {
        name: String
        price: Int
        day: String
    }
`;

export const foodResolvers = {
    Food: {}
};
