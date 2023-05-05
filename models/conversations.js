import { mongoose } from "../config/database.js";
const zpConversationsSchema = mongoose.Schema({
    user_id: Number,
    sender_id: Number,
    lastMessage: {
        text: String,
        createdAt: Date,
        sender: Number,
        read: Boolean,
        haveFile: Boolean,
    },
    createdAt: Date,
    isFollow: Boolean
});

const zpConversationsModel = mongoose.models.conversations || mongoose.model('conversations', zpConversationsSchema);

export { zpConversationsModel };
