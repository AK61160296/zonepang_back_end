import { Sequelize, Op } from 'sequelize';
import { connectDb } from '../config/database.js'
import { zpNotificationsModel } from '../models/notification.js';
import { zpConversationsModel } from '../models/index.js';
import { zpPostsModel, zpUserSettingsModel, zpUsersModel, zpAttchmentsPostsModel, zpCommentsModel, zpLikesModel, zpGroupsModel, zpMatchAttachmentsModel, zpBookmarksModel, zpFollowsModel } from '../models/index.js';
import * as cheerio from "cheerio";
import { URL } from "url";
import axios from 'axios';
import Fuse from 'fuse.js';
async function followUser(userId, userFollowId, type) {
    try {
        try {
            if (type == 'follow') {
                const userFollow = await zpFollowsModel.create({
                    user_id: userId,
                    user_follow_id: userFollowId,
                    create_at: Date.now(),
                    update_at: Date.now()
                });
                createNotificationFollow(userId, userFollowId)

            } else {
                const userFollow = await zpFollowsModel.destroy({
                    where: {
                        user_id: userId,
                        user_follow_id: userFollowId,
                    }
                });
                const updateConversationMe = await zpConversationsModel.updateOne(
                    {
                        user_id: userId,
                        sender_id: userFollowId,
                    },
                    {

                        isFollow: false
                    });
                const updateConversationSender = await zpConversationsModel.updateOne(
                    {
                        user_id: userFollowId,
                        sender_id: userId,
                    },
                    {
                        isFollow: false
                    });
            }

            return { status: 'success' };
        } catch (error) {
            console.error(error);
            return { status: 'error', error: error };
        }

    } catch (error) {

    }

}

async function createNotificationFollow(userId, userFollowId) {
    try {

        const userData = await zpUsersModel.findOne({
            attributes: ['id', 'name', 'avatar', 'code_user'],
            where: {
                id: userId
            }
        })

        const checkSettingNoti = await zpUserSettingsModel.findOne({
            where: {
                user_id: userFollowId
            }
        })
        const checkSettingNotiObj = JSON.parse(checkSettingNoti.dataValues.setting);
        if (checkSettingNotiObj.follow) {
            const notification = {
                user_id: userFollowId,
                noti_text: userData.dataValues.name + " เริ่มติดตามคุณ",
                noti_type: "follow",
                group_id_target: null,
                post_id_target: null,
                user_id_actor: userId,
                comment_id_target: null,
                read: false,
                create_at: new Date(),
            };
            zpNotificationsModel.create(notification)
        }

        return { status: 'success' };
    } catch (error) {
        console.error(error);
        return { status: 'error', error: error };
    }
}

async function getSettingNotification(userId) {

    try {
        const settingNoti = await zpUserSettingsModel.findOne({
            where: {
                user_id: userId
            }
        })
        const setting = JSON.parse(settingNoti.setting);

        return { status: 'success', settingNoti };
    } catch (error) {
        console.error(error);
        return { status: 'error', error: error };
    }

}


async function settingNotification(userId, all, comment, follow, tag, group, like) {
    try {
        var settingData = {
            all: all,
            comment: comment,
            follow: follow,
            tag: tag,
            group: group,
            like: like,
        };

        const stringifiedSettingData = JSON.stringify(settingData);

        const result = await zpUserSettingsModel.update(
            {
                setting: stringifiedSettingData,
            },
            {
                where: {
                    user_id: userId,
                },
            }
        );

        return { status: "success" };
    } catch (error) {
        console.error(error);
        return { status: "error", error: error };
    }
}

async function getUserProfile(userProfileId) {

    try {

        const userProfile = await zpUsersModel.findOne({
            where: {
                code_user: userProfileId
            }
        })

        const postCount = await zpPostsModel.count({
            where: {
                user_id: userProfile.id
            }
        })

        const follower = await zpFollowsModel.count({
            where: {
                user_id: userProfile.id
            }
        })

        const following = await zpFollowsModel.count({
            where: {
                user_follow_id: userProfile.id
            }
        })

        return { status: 'success', userProfile, postCount, follower, following };
    } catch (error) {
        console.error(error);
        return { status: 'error', error: error };
    }

}

async function getUserPath() {

    try {
        const userPath = await zpUsersModel.findAll({
            attributes: ["code_user"]
        })
        return { status: 'success', userPath };
    } catch (error) {
        console.error(error);
        return { status: 'error', error: error };
    }

}

async function getUserFollow(userId) {

    try {
        const userData = await zpFollowsModel.findAll({
            where: {
                user_id: userId
            },
            include: [
                {
                    model: zpUsersModel,
                    required: true,
                    attributes: ['id', 'name', 'avatar', 'code_user', 'provider', [
                        Sequelize.literal(`(
                      SELECT COUNT(*) 
                      FROM follows 
                      WHERE follows.user_follow_id = id
                    )`),
                        'follow_count'
                    ]],

                },
            ]
        })
        const promises = userData.map(async (user) => {
            let isOnline = false

            if (onlineUsersSystem.has(user.user.id)) {
                isOnline = true
            }
            return {
                ...user.toJSON(),
                isOnline
            }
        })

        const userFollow = await Promise.all(promises)


        return { status: 'success', userFollow };
    } catch (error) {
        console.error(error);
        return { status: 'error', error: error };
    }

}
async function checkFollow(userId, userFollowId) {
    try {
        let isFollow = false
        const status = await zpFollowsModel.count({
            where: {
                user_id: userId,
                user_follow_id: userFollowId
            }
        });
        if (status > 0) {
            isFollow = true
        }


        return { isFollow };
    } catch (error) {
        console.error(error);
        return { status: 'error', error: error };
    }
}
async function getUserInfo(userId) {
    try {
        const userDetail = await connectDb.query(`
        SELECT id,name,bio,provider,code_user,email,phone,real_email,line_id,avatar,fullname
        FROM users
        WHERE users.id = :userId
        LIMIT 1;
      `, {
            nest: true,
            type: Sequelize.QueryTypes.SELECT,
            replacements: {
                userId: userId
            }
        });

        const defaultAddress = await connectDb.query(`
        SELECT *
        FROM addresses
        WHERE addresses.user_id = :userId AND addresses.address_default = 1
        LIMIT 1;
      `, {
            nest: true,
            type: Sequelize.QueryTypes.SELECT,
            replacements: {
                userId: userId
            }
        });

        const address = await connectDb.query(`
        SELECT *
        FROM addresses
        WHERE addresses.user_id = :userId AND addresses.address_default = 0;
      `, {
            nest: true,
            type: Sequelize.QueryTypes.SELECT,
            replacements: {
                userId: userId
            }
        });
        return { userDetail: userDetail[0], defaultAddress: defaultAddress[0], address };
    } catch (error) {
        console.error(error);
        return { status: 'error', error: error };
    }
}
async function getUserAffiliate() {
    try {
        const userAff = await connectDb.query(`
        SELECT users.id AS _id,name,bio,provider,code_user,email,phone,real_email,line_id,avatar
        FROM users
        JOIN role_user ON role_user.user_id = users.id
        WHERE role_user.role_id = 3;
      `, {
            nest: true,
            type: Sequelize.QueryTypes.SELECT,
        });

        return { userAff };
    } catch (error) {
        console.error(error);
        return { status: 'error', error: error };
    }
}

async function getUserPartner() {
    try {
        const userPartner = await connectDb.query(`
        SELECT users.id AS _id,name,bio,provider,code_user,email,phone,real_email,line_id,avatar
        FROM users
        JOIN role_user ON role_user.user_id = users.id
        WHERE role_user.role_id = 2;
      `, {
            nest: true,
            type: Sequelize.QueryTypes.SELECT,
        });

        return { userPartner };
    } catch (error) {
        console.error(error);
        return { status: 'error', error: error };
    }
}

async function lineNotify(data) {
    const Token = "0veGQ4Qj4VdTR5ZB4yHx2fjut6hQbV1sD2VG7E4bepf";
    let str = "\nชื่อลูกค้า : " + data.name + "\n";
    str += "เบอร์โทรศัพท์ : " + data.phone + "\n";
    str += "อีเมล : " + data.email + "\n";
    str += "ไอดี LINE : " + data.line_id + "\n";
    str += "เรื่องที่ติดต่อ : " + data.about + "\n";

    try {
        const response = await axios.post(
            "https://notify-api.line.me/api/notify",
            `message=${str}`,
            {
                headers: {
                    "Authorization": `Bearer ${Token}`,
                    "Cache-Control": "no-cache",
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}


async function addPartner(name, phone, line_id, about, email) {

    try {
        const prepareAbout = {
            name: name,
            phone: phone,
            line_id: line_id,
            email: email,
            about: about
        };

        await connectDb.query(`
        INSERT INTO abouts (name, phone, line_id, email, about)
        VALUES (:name, :phone, :line_id, :email, :about)
      `, {
            replacements: {
                name: name,
                phone: phone,
                line_id: line_id,
                email: email,
                about: about
            }
        })
        await lineNotify(prepareAbout)

        return {
            success: 'Add partner successfully!'
        };
    } catch (error) {
        console.error(error);
        return { status: 'error', error: error };
    }

}
async function createAddress(user_id, full_name, phone, sub_district_and_area, district_and_area, country, address_default, postal_code, address_detail) {

    try {
        const checkDefault = await connectDb.query(`
        SELECT COUNT(*) FROM addresses WHERE user_id = :userId
        `, {
            replacements: {
                userId: user_id
            },
            type: Sequelize.QueryTypes.SELECT
        });

        let defaultAddress = 0;
        if (checkDefault[0]['COUNT(*)'] === 0) {
            defaultAddress = 1;
        }

        const addressData = await connectDb.query(`
        INSERT INTO addresses (user_id, fullname, phone, sub_district_and_area, district_and_area, country, address_default, postal_code, address_detail)
        VALUES (:user_id, :full_name, :phone, :sub_district_and_area, :district_and_area, :country, :address_default ,:postal_code, :address_detail)
      `, {
            replacements: {
                user_id: user_id,
                full_name: full_name,
                phone: phone,
                sub_district_and_area: sub_district_and_area,
                district_and_area: district_and_area,
                country: country,
                address_default: defaultAddress,
                postal_code: postal_code,
                address_detail: address_detail
            },
            type: Sequelize.INSERT,
        })

        const insertedAddressId = addressData[0];

        const insertedAddress = await connectDb.query(`
        SELECT * FROM addresses WHERE id = :insertedAddressId
        `, {
            replacements: {
                insertedAddressId: insertedAddressId
            },
            type: Sequelize.QueryTypes.SELECT
        });

        return {
            success: 'create Address successfully!',
            addressData: insertedAddress[0],
            checkDefault: checkDefault
        };

    } catch (error) {
        console.error(error);
        return { status: 'error', error: error };
    }

}

async function editAddress(addressId, fullname, phone, sub_district_and_area, district_and_area, country, postal_code, address_detail) {
    try {
        const addressData = await connectDb.query(`
        UPDATE addresses
        SET fullname = :fullname,
            phone = :phone,
            sub_district_and_area = :sub_district_and_area,
            district_and_area = :district_and_area,
            country = :country,
            postal_code = :postal_code,
            address_detail = :address_detail
        WHERE id = :addressId;
      `, {
            replacements: {
                addressId: addressId,
                fullname: fullname,
                phone: phone,
                sub_district_and_area: sub_district_and_area,
                district_and_area: district_and_area,
                country: country,
                postal_code: postal_code,
                address_detail: address_detail
            }
        });
        return {
            success: 'Edit Address successfully!',
        };

    } catch (error) {
        console.error(error);
        return { success: 'error', error: error };
    }
}
async function defaultAddress(userId, addressId) {
    try {
        await connectDb.query(`
        UPDATE addresses
        SET address_default = 0
        WHERE user_id = :userId AND address_default = 1;
      `, {
            replacements: {
                userId: userId
            }
        });

        await connectDb.query(`
        UPDATE addresses
        SET address_default = 1
        WHERE id = :addressId
      `, {
            replacements: {
                addressId: addressId
            }
        });
        return {
            success: 'Update Address successfully!',
        };

    } catch (error) {
        console.error(error);
        return { success: 'error', error: error };
    }
}

async function deleteAddress(addressId) {
    try {
        await connectDb.query(`
        DELETE FROM addresses
        WHERE id = :addressId
      `, {
            replacements: {
                addressId: addressId
            }
        });

        return {
            success: 'Delete Address successfully!',
        };
    } catch (error) {
        console.error(error);
        return {
            success: false,
            error: error
        };
    }
}

async function searchUsers(userId, keywords) {
    try {

        const users = await zpFollowsModel.findAll({
            where: {
                user_id: userId
            },
            include: [
                {
                    model: zpUsersModel,
                    required: true,
                    attributes: ['id', 'name', 'avatar', 'code_user', 'provider'],
                    where: {
                        [Op.or]: [
                            { name: { [Op.like]: `%${keywords}%` } },
                            { fullname: { [Op.like]: `%${keywords}%` } },
                        ],
                    },
                    as: 'user' // เพิ่มส่วนนี้เพื่อระบุการใช้ชื่อที่ต้องการให้เข้าถึง
                },
            ]
        });
        const usersData = users.map((user) => user.user);

        const promises = usersData.map(async (user) => {
            let isOnline = false

            if (onlineUsersSystem.has(user.id)) {
                isOnline = true
            }
            return {
                ...user.get({ plain: true }),
                isOnline
            }
        })

        const userFollow = await Promise.all(promises)

        var fuse = new Fuse([...userFollow], {
            keys: ["name"],
        });

        let sliceArr = fuse.search(keywords);
        const result = sliceArr.slice(0, 50);
        return { status: "success", result };

    } catch (error) {
        console.error(error);
        return { status: 'error', error: error };
    }
}

async function usersZonepang(keywords) {
    try {

        const users = await zpUsersModel.findAll({
            where: {
                [Op.or]: [
                    { name: { [Op.like]: `%${keywords}%` } },
                    { fullname: { [Op.like]: `%${keywords}%` } },
                    { email: { [Op.like]: `%${keywords}%` } },
                ],
            },
            required: true,
            attributes: ['id', 'name', 'avatar', 'code_user', 'provider', 'phone', 'email'],
        });
        var fuse = new Fuse([...users], {
            keys: ["name", 'fullname', 'email'],
        });

        let sliceArr = fuse.search(keywords);
        const result = sliceArr.slice(0, 50);

        return { status: "success", result };
    } catch (error) {
        console.error(error);
        return { status: 'error', error: error };
    }
}

export {
    usersZonepang,
    checkFollow,
    followUser,
    getUserFollow,
    settingNotification,
    getSettingNotification,
    getUserProfile,
    getUserPath,
    getUserInfo,
    getUserAffiliate,
    getUserPartner,
    addPartner,
    createAddress,
    editAddress,
    defaultAddress,
    deleteAddress,
    searchUsers
}