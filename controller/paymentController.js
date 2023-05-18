import { zpProductsModel, zpPackageDetailsModel, zpOrdersModel, zpUsersModel } from '../models/index.js';
import mongoose from 'mongoose';

async function postAddOrderGB(userId, productPrice, productAmount, productId, packageId, productOld, referenceNo) {
    try {
        const userData = await zpUsersModel.findOne({
            where: {
                id: userId
            }

        })
        const productData = await zpProductsModel.findOne({
            where: {
                id: productId
            }

        })
        const packDetailData = await zpPackageDetailsModel.findOne({
            where: {
                id: packageId
            }
        })
        const checkOrder = await zpOrdersModel.findOne({
            where: {
                package_detail_id: packageId,
                product_id: productId,
                user_id: userId,
                status: 1,
            }
        })


        return { status: "success", userData, productData, packDetailData, checkOrder };
    } catch (error) {
        console.error(error);
        return { status: 'error', error: error };
    }
}

export {
    postAddOrderGB,
}
