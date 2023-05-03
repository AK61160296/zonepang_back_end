import { mongoose } from "../config/database.js";
const zpMessagesSchema = mongoose.Schema(
    {
        message: {
            text: { type: String, required: true },
        },
        users: Array,
        sender: {
            type: Number,
            ref: "User",
            required: true,
        },
    },
    {
        timestamps: true,
    }
    // {
    // conversation_id: mongoose.Schema.Types.ObjectId,
    // sender_id: Number,
    // receiver_id: Number,
    // message: String,
    // created_at: Date,
    // }
);

const zpMessagesModel = mongoose.models.messages || mongoose.model('messages', zpMessagesSchema);

export { zpMessagesModel };
