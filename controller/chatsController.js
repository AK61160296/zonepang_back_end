import { zpConversationsModel, zpMessagesModel, zpUsersModel } from '../models/index.js';
import mongoose from 'mongoose';
async function addMessages(from, to, message, files) {
    try {
        //ตรวจสอบข้อมูลของการสนทนาครั้งเเรก
        const conversation = await zpConversationsModel.findOne({ $and: [{ user_id: from }, { sender_id: to }] });
        if (!conversation) {
            const newConversationMe = await zpConversationsModel.create({
                user_id: from,
                sender_id: to,
                createdAt: Date.now(),
                isFollow: true,
            });
            const newConversationSender = await zpConversationsModel.create({
                user_id: to,
                sender_id: from,
                createdAt: Date.now(),
                isFollow: true,
            });
        }
        const haveFile = files && files.length > 0;
        const lastMessage = {
            text: message,
            createdAt: new Date(),
            sender: from,
            read: false,
            haveFile: haveFile,
        };


        await zpConversationsModel.updateMany(
            { user_id: { $in: [from, to] }, sender_id: { $in: [from, to] } },
            { $set: { lastMessage } }
        );


        if (onlineUsersInChat.has(to)) {
            await zpConversationsModel.updateOne(
                {
                    user_id: to,
                    sender_id: from,
                },
                {
                    $set: {
                        "lastMessage.read": true
                    },
                }
            );
        }
        if (onlineUsersInChat.has(from)) {
            await zpConversationsModel.updateOne(
                {
                    user_id: from,
                    sender_id: to,
                },
                {
                    $set: {
                        "lastMessage.read": true
                    },
                }
            );
        }
        const messagePrepare = new zpMessagesModel({
            message: { text: message },
            users: [from, to],
            sender: from,
            images: [] // สร้าง Array เปล่าไว้เพื่อเก็บชื่อไฟล์ภาพ
        });

        if (files && files.length > 0) {
            const images = files.map(image => image.key)
            messagePrepare.images.push(...images)
        }
        const newMessage = await messagePrepare.save();

        if (newMessage) return { status: 'success', msg: "Message added successfully." };
        else return { msg: "Failed to add message to the database" };
    } catch (error) {
        console.error(error);
        return { status: 'error', error: error };
    }
}


async function getConversations(userId, page) {
    try {
        let conversation = await zpConversationsModel.find({ user_id: userId }).sort({ 'lastMessage.createdAt': -1 });;
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
            let fromSelf = false
            if (data.lastMessage) {
                fromSelf = data.lastMessage.sender == userId
            }

            return {
                ...data.toJSON(),
                userMe,
                userSender,
                fromSelf,
            };
        });
        conversation = await Promise.all(promises);

        return { conversation };
    } catch (error) {
        console.error(error);
        return { status: 'error', error: error };
    }
}

async function getMessages(from, to, page) {
    try {
        const limit = 15;
        const offset = (page - 1) * limit;


        const Update = await zpConversationsModel.updateOne(
            {
                user_id: from,
                sender_id: to,
            },
            {
                $set: {
                    "lastMessage.read": true
                },
            }
        );

        const messages = await zpMessagesModel.find({
            users: {
                $all: [from, to],
            },
        }).sort({ updatedAt: -1 })
            .skip(offset)
            .limit(limit);


        const projectedMessages = messages.map((msg) => {
            let images = []
            if (msg.images) {
                images = msg.images
            }
            return {
                images: images,
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

async function getMessageUnread(userId) {
    try {
        let result = await zpConversationsModel.count({ user_id: userId, 'lastMessage.read': false })

        return { result };
    } catch (error) {
        console.error(error);
        return { status: 'error', error: error };
    }
}

export {
    getMessageUnread,
    addMessages,
    getConversations,
    getMessages
}
