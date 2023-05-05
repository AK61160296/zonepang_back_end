import { mongoose } from "../config/database.js";
const zpMessagesSchema = mongoose.Schema(
    {
        message: {
            text: { type: String, required: false },
        },
        users: Array,
        sender: {
            type: Number,
            ref: "User",
            required: true,
        },
        images: [String]
    },
    {
        timestamps: true,
    }
);

const zpMessagesModel = mongoose.models.messages || mongoose.model('messages', zpMessagesSchema);

export { zpMessagesModel };
