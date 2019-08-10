import { Schema, model, Document } from 'mongoose';

export interface IRestaurant extends Document {
    name: string;
    averageRatings?: number;
    menus: Array<{
        start_date: string;
        end_date: string;
        foods: any[];
    }>;
}

export const restaurantSchema: Schema<IRestaurant> = new Schema({
    name: {
        type: String,
        required: true,
        minlength: 3
    },
    averageRatings: {
        type: Number,
        min: 0,
        max: 5,
        default: 0
    },
    menus: [
        {
            start_date: {
                type: String,
                required: true
            },
            end_date: {
                type: String,
                required: true
            },
            foods: [
                {
                    type: Schema.Types.ObjectId,
                    ref: 'food'
                }
            ]
        }
    ]
});

export default model<IRestaurant>('restaurant', restaurantSchema);
