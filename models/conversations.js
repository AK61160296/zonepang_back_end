import { mongoose } from "../config/database.js";
const zpConversationsSchema = mongoose.Schema({
    user_id: Number,
    sender_id: Number,
    sender_id: Number,
    receiver_id: Number,
    lastMessage: {
        text: String,
        createdAt: Date,
        lastUserId: Number
    },
    userSender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
    },
    userReceiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
    },
});

const zpConversationsModel = mongoose.models.conversations || mongoose.model('conversations', zpConversationsSchema);

export { zpConversationsModel };
