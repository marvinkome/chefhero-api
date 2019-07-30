import { Schema, model, Document } from 'mongoose';

export interface IRestaurant extends Document {
    name: string;
}

export const restaurantSchema: Schema<IRestaurant> = new Schema({
    name: {
        type: String,
        required: true,
        minlength: 3
    }
});

export default model<IRestaurant>('restaurant', restaurantSchema);
