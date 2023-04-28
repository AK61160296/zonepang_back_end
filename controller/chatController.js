import { zpConversationsModel, zpMessagesModel } from '../models/index.js';
import mongoose from 'mongoose';
import { zpUsersModel } from '../models/users.js';


async function addMessages(userId, receiverId, messageText) {
    try {
        let messageText = "Hello, how are you?"

        // 1. ตรวจสอบว่า document ของ `zpConversationsModel` ที่มีผู้ใช้งานเป็นเจ้าของหรือถูกส่งถึงมีอยู่ใน collection หรือไม่
        const conversation = await zpConversationsModel.findOne({
            user_id: userId,
            withUser: receiverId,
        });

        let conversationId;
        // 2. ถ้ายังไม่มี document ให้สร้าง document ใหม่
        if (!conversation) {
            const newConversation = await zpConversationsModel.create({
                user_id: userId,
                withUser: receiverId,
                lastMessage: {
                    text: messageText,
                    createdAt: new Date(),
                },
            });
            conversationId = newConversation._id;
        }
        else {
            conversationId = conversation._id;
            await zpConversationsModel.updateOne(
                { _id: conversationId },
                {
                    $set: {
                        lastMessage: {
                            text: messageText,
                            createdAt: new Date(),
                        },
                    },
                }
            );
        }

        const newMessage = {
            user_id: userId,
            conversation_id: conversationId,
            sender_id: userId,
            receiver_id: receiverId,
            message: messageText,
            created_at: new Date(),
        };
        const result = await zpMessagesModel.create(newMessage);

        return { status: "success", result };
    } catch (error) {
        console.error(error);
        return { status: 'error', error: error };
    }
}


async function getMessages(userId, page) {
    try {

        return { status: "success" };
    } catch (error) {
        console.error(error);
        return { status: 'error', error: error };
    }
}

export {
    addMessages,
    getMessages,
}
