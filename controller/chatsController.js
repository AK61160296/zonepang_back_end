import { zpConversationsModel, zpMessagesModel, zpUsersModel } from '../models/index.js';
import mongoose from 'mongoose';



async function addMessages(from, to, message) {
    try {
        const data = await zpMessagesModel.create({
            message: { text: message },
            users: [from, to],
            sender: from,
        });

        if (data) return { msg: "Message added successfully." };
        else return { msg: "Failed to add message to the database" };
        // const conversation = await zpConversationsModel.findOne({ $or: [{ sender_id: userId }, { receiver_id: userId }] });
        // console.log("conversation", conversation)
        // let conversationId;
        // // 2. ถ้ายังไม่มี document ให้สร้าง document ใหม่
        // if (!conversation) {
        //     const newConversation = await zpConversationsModel.create({
        //         user_id: userId,
        //         sender_id: senderId,
        //         receiver_id: receiverId,
        //         lastMessage: {
        //             text: messageText,
        //             createdAt: new Date(),
        //             lastUserId: userId
        //         },
        //     });
        //     conversationId = newConversation._id;
        // }
        // else {
        //     conversationId = conversation._id;
        //     await zpConversationsModel.updateOne(
        //         {
        //             _id: conversationId,
        //         },

        //         {
        //             sender_id: senderId,
        //             receiver_id: receiverId,
        //             $set: {
        //                 lastMessage: {
        //                     text: messageText,
        //                     createdAt: new Date(),
        //                     lastUserId: userId
        //                 },
        //             },
        //         }
        //     );
        // }

        // const newMessage = {
        //     conversation_id: conversationId,
        //     sender_id: senderId,
        //     receiver_id: receiverId,
        //     message: messageText,
        //     created_at: new Date(),
        // };
        // const result = await zpMessagesModel.create(newMessage);

        // return { status: "success" };
    } catch (error) {
        console.error(error);
        return { status: 'error', error: error };
    }
}


async function getConversations(userId, page) {
    try {
        let conversation = await zpConversationsModel.find({ user_id: userId });
        const promises = conversation.map(async (data) => {
            let userMe = await zpUsersModel.findOne({
                attributes: ['id', 'name', 'avatar', 'code_user'],
                where: {
                    id: data.user_id
                }
            })
            let userSender = await zpUsersModel.findOne({
                attributes: ['id', 'name', 'avatar', 'code_user'],
                where: {
                    id: data.sender_id
                }
            })

            return {
                ...data.toJSON(),
                userMe,
                userSender
            };
        });
        conversation = await Promise.all(promises);

        return { conversation };
    } catch (error) {
        console.error(error);
        return { status: 'error', error: error };
    }
}

async function getMessages(from, to) {
    try {

        const messages = await zpMessagesModel.find({
            users: {
                $all: [from, to],
            },
        }).sort({ updatedAt: 1 });

        const projectedMessages = messages.map((msg) => {
            return {
                fromSelf: msg.sender === from,
                message: msg.message.text,
                createdAt: msg.createdAt,
            };
        });
        return { projectedMessages };
    } catch (ex) {
        console.log("Error:", ex)
    }
};



export {
    addMessages,
    getConversations,
    getMessages
}
