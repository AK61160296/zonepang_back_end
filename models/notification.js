import { mongoose } from "../config/database.js";
const zpNotificationsSchema = mongoose.Schema({
    user_id: Number,
    noti_type: String,
    read: Boolean,
    noti_text: String,
    group_id_target: Number,
    post_id_target: Number,
    user_id_target: Number,
    create_at: Date,
});

const zpNotificationsModel = mongoose.models.notification || mongoose.model('notification', zpNotificationsSchema);

export { zpNotificationsModel };
