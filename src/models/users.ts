import { Schema, model, Document } from 'mongoose';
import { hash, compare } from 'bcrypt';

export interface IUser extends Document {
    email: string;
    username: string;
    password: string;
    location: string;
    favourite_restaurants: any[];
    cart: {
        totalAmount: number;
        items: Array<{
            id?: string;
            food: any;
            quantity: number;
        }>;
    };
    orders: Array<{
        date: Date;
        meals: any[];
    }>;
    verify_password: (password: string) => Promise<boolean>;
}

export const userSchema: Schema<IUser> = new Schema({
    username: {
        type: String,
        unique: true,
        minlength: 3,
        required: true
    },
    email: {
        type: String,
        unique: true,
        minlength: 3,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    favourite_restaurants: [
        {
            type: Schema.Types.ObjectId,
            ref: 'restaurant'
        }
    ],
    cart: {
        totalAmount: Number,
        items: [
            {
                food: {
                    type: Schema.Types.ObjectId,
                    ref: 'food'
                },
                quantity: {
                    type: Number,
                    default: 1
                }
            }
        ]
    },
    orders: [
        {
            date: {
                type: Date,
                required: true
            },
            meals: [
                {
                    type: Schema.Types.ObjectId,
                    ref: 'food'
                }
            ]
        }
    ]
});

userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }

    // @ts-ignore
    const passwordHash = await hash(this.password, 10);

    // @ts-ignore
    this.password = passwordHash;
    next();
});

userSchema.methods.verify_password = function(password: string) {
    return compare(password, this.password);
};

export default model<IUser>('User', userSchema);
