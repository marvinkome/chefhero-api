import { makeExecutableSchema, ApolloServer } from 'apollo-server-express';
import { getTokenFromHeaders, getUserFromToken } from '@libs/auth';
import { IUser } from '@models/users';

// types and resolvers
import { queryType, queryResolver } from './queries';
import { mutationType, mutationResolvers } from './mutation';
import { userType, userResolvers } from './queries/users';
import { restaurantType, restaurantResolvers } from './queries/restaurant';
import { foodType, foodResolvers } from './queries/food';

const schema = makeExecutableSchema({
    typeDefs: [queryType, mutationType, userType, restaurantType, foodType],
    resolvers: [
        queryResolver,
        mutationResolvers,
        userResolvers,
        restaurantResolvers,
        foodResolvers
    ]
});

export interface IContext {
    authToken: string | null;
    currentUser: IUser | null;
}

export default new ApolloServer({
    schema,
    context: async ({ req }): Promise<IContext> => {
        const authToken = getTokenFromHeaders(req);
        let currentUser = null;

        try {
            currentUser = await getUserFromToken(authToken || '');
        } catch (e) {
            console.error(e.message);
            console.error(`Unable to authenticate using token: ${authToken}`);
        }

        return {
            authToken,
            currentUser
        };
    }
});
