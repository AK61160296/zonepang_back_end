import { mongoose } from "../config/database.js";
const zpConversationsSchema = mongoose.Schema({
    user_id: Number,
    withUser: Number,
    lastMessage: {
        text: String,
        createdAt: Date
    }
});

const zpConversationsModel = mongoose.models.conversations || mongoose.model('conversations', zpConversationsSchema);

export { zpConversationsModel };
