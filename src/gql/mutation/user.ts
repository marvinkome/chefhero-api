import { authenticated } from '@libs/auth';
import { IContext } from '@gql/index';

export const typeDef = `
    updateProfile(location: String, email: String): User
`;

export const resolver = {
    updateProfile: authenticated(
        async (_: any, data: any, context: IContext) => {
            const { currentUser } = context;
            if (!currentUser) {
                throw Error('User not found');
            }

            if (data.location) {
                currentUser.location = data.location;
            }

            if (data.email) {
                currentUser.email = data.email;
            }

            return currentUser.save();
        }
    )
};
