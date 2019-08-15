import { gql } from 'apollo-server-express';

export const foodType = gql`
    type Food {
        id: ID
        name: String
        price: Int
        day: String
    }
`;

export const foodResolvers = {
    Food: {}
};
