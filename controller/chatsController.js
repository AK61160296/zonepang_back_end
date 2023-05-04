import { zpConversationsModel, zpMessagesModel, zpUsersModel } from '../models/index.js';
import mongoose from 'mongoose';



async function addMessages(from, to, message) {
    try {
        const lastMessage = {
            text: message,
            createdAt: new Date(),
            sender: from,
        };

        const conversation = await zpConversationsModel.findOne({ $and: [{ user_id: from }, { sender_id: to }] });
        console.log("conversation",conversation)
        if (!conversation) {         
            const newConversationMe = await zpConversationsModel.create({
                user_id: from,
                sender_id: to,
                lastMessage: null,
                createdAt: Date.now(),
                isFollow: true
            });
            const newConversationSender = await zpConversationsModel.create({
                user_id: to,
                sender_id: from,
                lastMessage: null,
                createdAt: Date.now(),
                isFollow: true
            });
        }

        await zpConversationsModel.updateMany(
            { user_id: { $in: [from, to] }, sender_id: { $in: [from, to] } },
            { $set: { lastMessage } }
        );


        const data = await zpMessagesModel.create({
            message: { text: message },
            users: [from, to],
            sender: from,
        });


        if (data) return { msg: "Message added successfully." };
        else return { msg: "Failed to add message to the database" };
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
                userSender,
                fromSelf: data.lastMessage.sender == userId,
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
