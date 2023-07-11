import { zpProductsModel, zpPackageDetailsModel, zpOrdersModel, zpUsersModel, zpSlipPaymentsModel } from '../models/index.js';
import mongoose from 'mongoose';
import axios from 'axios';
async function postAddOrderGB(userId, productPrice, productAmount, productId, packageId, productOld, oldReferenceNo) {
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
                referenceNo: oldReferenceNo,
                product_id: productId,
                user_id: userId,
                status: 1,
            }
        })
        if (checkOrder && productOld !== 'false') {
            return { order: checkOrder, status: 1, productOld };
        }

        const checkOrderPayment = await zpOrdersModel.findOne(({
            where: {
                package_detail_id: packageId,
                product_id: productId,
                user_id: userId,
                status: 0,
            }
        }))

        if (checkOrderPayment) {
            var checkTypeProduct = await zpProductsModel.findOne({
                where: {
                    id: checkOrderPayment.product_id
                }
            })
            var total_zone_commission = (productData.commission / 100) * productAmount;
            var amount_com_zone = productAmount - total_zone_commission;

            if (userData.aff_code) {
                var total_aff_commission = (packDetailData.package_payoff / 100) * productAmount;
                var amount_com_aff = productAmount - total_aff_commission;
            } else {
                var total_aff_commission = 0;
            }

            if (checkTypeProduct.category_id == 4) {
                await checkOrderPayment.update({
                    total_price: productPrice,
                    package_price: packDetailData.package_price,
                    count: productAmount,
                    total_zone_commission: total_zone_commission,
                    total_aff_commission: total_aff_commission,
                    amount_com_zone: amount_com_zone,
                    amount_com_aff: amount_com_aff,
                })
                productPrice = checkOrderPayment.total_price;
                var referenceNo = checkOrderPayment.referenceNo;

            } else {
                await checkOrderPayment.update({
                    total_price: productPrice,
                    package_detail_id: packageId,
                    package_price: packDetailData.package_price,
                    total_zone_commission: total_zone_commission,
                    total_aff_commission: total_aff_commission,
                    amount_com_zone: amount_com_zone,
                    amount_com_aff: amount_com_aff,
                })
                productPrice = checkOrderPayment.total_price;
                var referenceNo = checkOrderPayment.referenceNo;
            }
        } else {
            let checkOrder;
            var referenceNo
            do {
                const rand_string = Math.floor(Math.random() * (99999 - 10000 + 1) + 10000);
                referenceNo = new Date().toISOString().slice(0, 10).replace(/-/g, '') + rand_string + '02';
                // ทำการค้นหาในฐานข้อมูล
                checkOrder = await zpOrdersModel.findOne({ where: { referenceNo: referenceNo } });
            } while (checkOrder);

            var total_zone_commission = (productData.commission / 100) * productAmount;
            var amount_com_zone = productAmount - total_zone_commission;
            if (userData.aff_code) {
                var total_aff_commission = (packDetailData.package_payoff / 100) * productAmount;
                var amount_com_aff = productAmount - total_aff_commission;
            } else {
                var total_aff_commission = 0;
            }

            await zpOrdersModel.create({
                user_id: userId,
                package_detail_id: packageId,
                status: 0,
                product_id: productId,
                total_price: productPrice,
                package_price: packDetailData.package_price,
                count: productAmount,
                referenceNo: referenceNo,
                total_zone_commission: total_zone_commission,
                total_aff_commission: total_aff_commission,
                amount_com_zone: amount_com_zone,
                amount_com_aff: amount_com_aff,
                created_at: Date.now(),
                updated_at: Date.now()
            })
        }


        if (productPrice) {
            const token = process.env.TokenGB;
            const tokenKey = encodeURIComponent(token);
            const backgroundUrl = 'https://api.zonepang.com/api/depositGB';
            const url = 'https://api.gbprimepay.com/gbp/gateway/qrcode';
            var field = `token=${tokenKey}&referenceNo=${referenceNo}&amount=${productPrice}&backgroundUrl=${backgroundUrl}`;

            const requestHeaders = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Cache-Control': 'no-cache',
            };

            const response = await axios.post(url, field,
                {
                    headers: requestHeaders,
                    responseType: 'arraybuffer',
                }
            );
            const output = response.data;
            var body = `data:image/png;base64,${Buffer.from(output).toString('base64')}`;
        }

        return { status: "0", msg: 'QR Payment success', field, productPrice: productPrice, img_qr: body, idQr: referenceNo };
    } catch (error) {
        console.error(error);
        return { status: 'error', error: error };
    }
}

async function checkQrPayment(idQR) {
    try {
        const checkStatusPayment = await zpOrdersModel.findOne({
            where: {
                referenceNo: idQR,
                status: 1
            }
        })
        if (checkStatusPayment) {
            return { order: checkStatusPayment, success: true };
        } else {
            return { order: checkStatusPayment, success: false };
        }

    } catch (error) {
        console.error(error);
        return { status: 'error', error: error };
    }
}

async function depositGB(message) {
    try {
        if (message) {
            const referenceNo = message.referenceNo;
            const check = await zpOrdersModel.findOne({
                where: {
                    referenceNo: referenceNo,
                },
            });
            if (check) {
                if (message.resultCode == '00') {
                    await check.update({
                        status: 1,
                        resultCode: message.resultCode,
                        amount: message.amount,
                        gbpReferenceNo: message.gbpReferenceNo,
                        currencyCode: message.currencyCode,
                        issue_date: Date.now()
                    })
                }
                return { status: 'success', message: "ชำระเงินสำเร็จ" };
            }else{
                return { status: 'error', message: "ชำระเงินไม่สำเร็จ" };
            }
        }
   
    } catch (error) {
        console.error(error);
        return { status: 'error', error: error };
    }
}
async function createSlip(userId, files, fname, dateTimepayment, order_id, codeOrder, email, phone, price) {
    try {
        let fileName;
        if (files && files.length > 0) {
            fileName = files[0].key
            const createSlip = await zpSlipPaymentsModel.create({
                user_id: userId,
                referenceNo: codeOrder,
                fname: fname,
                full_name: fname,
                email: email,
                phone: phone,
                price: price,
                date_payment: dateTimepayment,
                img_slip: fileName,
                created_at: Date.now(),
                updated_at: Date.now()
            })
            await zpOrdersModel.update(
                {
                    status: 2,
                    buyer_name: fname,
                    buyer_phone: phone,
                    buyer_email: email,
                    img_payment: fileName,
                },
                {
                    where: { id: order_id }
                })
            return { status: 'success', mgs: 'ส่งหลักฐานการชำระเงินเรียบร้ย' };
        } else {
            return { status: 'error', mgs: 'กรุณาส่งหลักฐานการชำระเงินให้ครบถ้วน' };
        }


    } catch (error) {
        console.error(error);
        return { status: 'error', error: error };
    }
}


export {
    postAddOrderGB,
    checkQrPayment,
    depositGB,
    createSlip
}
