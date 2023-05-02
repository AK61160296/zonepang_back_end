import { zpConversationsModel, zpMessagesModel, zpUsersModel } from '../models/index.js';
import mongoose from 'mongoose';



async function addMessages(userId, senderId, receiverId, messageText) {
    try {
        const conversation = await zpConversationsModel.findOne({ $or: [{ sender_id: userId }, { receiver_id: userId }] });
        console.log("conversation", conversation)
        let conversationId;
        // 2. ถ้ายังไม่มี document ให้สร้าง document ใหม่
        if (!conversation) {
            const newConversation = await zpConversationsModel.create({
                user_id: userId,
                sender_id: senderId,
                receiver_id: receiverId,
                lastMessage: {
                    text: messageText,
                    createdAt: new Date(),
                    lastUserId: userId
                },
            });
            conversationId = newConversation._id;
        }
        else {
            conversationId = conversation._id;
            await zpConversationsModel.updateOne(
                {
                    _id: conversationId,
                },

                {
                    sender_id: senderId,
                    receiver_id: receiverId,
                    $set: {
                        lastMessage: {
                            text: messageText,
                            createdAt: new Date(),
                            lastUserId: userId
                        },
                    },
                }
            );
        }

        const newMessage = {
            conversation_id: conversationId,
            sender_id: senderId,
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
        let conversation = await zpConversationsModel.find({ $or: [{ sender_id: userId }, { receiver_id: userId }] });
        const promises = conversation.map(async (data) => {
            let userSender = await zpUsersModel.findOne({
                attributes: ['id', 'name', 'avatar', 'code_user'],
                where: {
                    id: data.sender_id
                }
            })
            let userData = {}
            if (userId == data.sender_id) {
                userData = await zpUsersModel.findOne({
                    attributes: ['id', 'name', 'avatar', 'code_user'],
                    where: {
                        id: data.receiver_id
                    }
                })
            } else {
                userData = await zpUsersModel.findOne({
                    attributes: ['id', 'name', 'avatar', 'code_user'],
                    where: {
                        id: data.sender_id
                    }
                })
            }

            return {
                ...data.toJSON(),
                userData
            };
        });
        conversation = await Promise.all(promises);

        return { conversation };
    } catch (error) {
        console.error(error);
        return { status: 'error', error: error };
    }
}

export {
    addMessages,
    getMessages,
}
