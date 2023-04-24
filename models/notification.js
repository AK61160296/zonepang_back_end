import { mongoose } from "../config/database.js";
const zpNotificationsSchema = mongoose.Schema({
    create_at: Date,
    user_id: Number,
    group_id_target: Number,
    noti_type: String,
    post_id_target: Number,
    read: Boolean,
    user_id_target: Number,
    noti_text: String
});

const zpNotificationsModel = mongoose.models.notification || mongoose.model('notification', zpNotificationsSchema);

export { zpNotificationsModel };
