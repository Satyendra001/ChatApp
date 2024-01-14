import mongoose, { model, Schema } from "mongoose";

const MessageSchema = new Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    text: String,
}, { timestamps: true });

export const MessageModel = model('Message', MessageSchema);
