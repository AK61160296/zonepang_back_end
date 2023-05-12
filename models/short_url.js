import { mongoose } from "../config/database.js";
const zpShortUrlSchema = mongoose.Schema(
    {
        originalUrl: String,
        shortUrl: String,
    },
    {
        timestamps: true,
    }
);

const zpShortUrlModel = mongoose.model('short_url', zpShortUrlSchema);

export { zpShortUrlModel };
