import { Schema, model, Document } from 'mongoose';

export interface IFood extends Document {
    name: string;
    price: number;
    day:
        | 'monday'
        | 'tuesday'
        | 'wednesday'
        | 'thursday'
        | 'friday'
        | 'saturday'
        | 'sunday';
}

export const foodSchema: Schema<IFood> = new Schema({
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    day: {
        type: String,
        required: true,
        enum: [
            'monday',
            'tuesday',
            'wednesday',
            'thursday',
            'friday',
            'saturday',
            'sunday'
        ]
    }
});

export default model<IFood>('food', foodSchema);
