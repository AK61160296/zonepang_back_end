import { Sequelize, Op } from 'sequelize';
import { zpNotificationsModel } from '../models/notification.js';
import { zpReportsModel, zpReportTypeModel, zpReportListModel } from '../models/index.js';
import { connectDb } from '../config/database.js'
async function getAllProduct() {
    try {
        const catagory = await connectDb.query(`
        SELECT * FROM categories
        WHERE status_category = 1;`, {
            nest: true,
            type: Sequelize.SELECT
        });

        const type_product = await connectDb.query(`
        SELECT * FROM type_products
        WHERE status_product_type = 1;`, {
            nest: true,
            type: Sequelize.SELECT
        });

        return { catagory, type_product };
    } catch (error) {
        console.error(error);
        return { status: 'error', error: error };
    }
}

async function getProducts(categoryId, type, tag_special) {
    try {
        if (type) {
            const products = await connectDb.query(`
            SELECT tag_type_products.*, products.*
            FROM tag_type_products
            JOIN categories ON categories.id = tag_type_products.category_id
            JOIN type_products ON type_products.id = tag_type_products.type_product_id
            JOIN products ON products.id = tag_type_products.product_id
            WHERE tag_type_products.category_id = :categoryId
              AND products.status = 1
              AND tag_type_products.type_product_id = :type
            ORDER BY tag_type_products.sort ASC;
          `, {
                nest: true,
                replacements: { categoryId: categoryId, type: type },
                type: Sequelize.SELECT
            });

            return products;
        } else {
            if (tag_special) {
                const products = await connectDb.query(`
              SELECT tag_special_sorts.*, products.*
              FROM tag_special_sorts
              JOIN products ON products.id = tag_special_sorts.product_id
              WHERE tag_special_sorts.tag_special_id = :tag_special
                AND products.status = 1
              ORDER BY tag_special_sorts.sort ASC;
            `, {
                    nest: true,
                    replacements: { tag_special: tag_special },
                    type: Sequelize.SELECT
                });

                return products;
            } else {
                const products = await connectDb.query(`
              SELECT *
              FROM products
              WHERE products.status = 1
                AND products.category_id = :categoryId
              ORDER BY products.sort_order ASC;
            `, {
                    nest: true,
                    replacements: { categoryId: categoryId },
                    type: Sequelize.SELECT
                });

                return products;
            }
        }
    } catch (error) {
        console.error(error);
        return { status: 'error', error: error };
    }


}

async function salepageDetail(productId) {
    try {

        const product = await connectDb.query(`
        SELECT products.*, products.id AS p_id
        FROM products
        WHERE products.id = :productId
        LIMIT 1;
      `, {
            nest: true,
            replacements: {
                productId: productId,
            },
            type: Sequelize.SELECT
        });

        const theme = await connectDb.query(`
        SELECT *
        FROM theme_colors
        WHERE theme_colors.id = :theme_color_id
        LIMIT 1;
      `, {
            nest: true,
            replacements: {
                theme_color_id: product[0].theme_color_id,
            },
            type: Sequelize.SELECT
        });

        product[0].theme = theme[0];

        const salePage = await connectDb.query(`
        SELECT salepages.*, salepages.id AS s_id
        FROM salepages
        WHERE salepages.product_id = :product_id
        LIMIT 1;
      `, {
            nest: true,
            replacements: {
                product_id: product[0].id,
            },
            type: Sequelize.SELECT
        });

        const salepage_detail = await connectDb.query(`
        SELECT salepage_details.*, salepage_details.id AS sd_id
        FROM salepage_details
        WHERE salepage_details.salepage_id = :salepage_id;
        `, {
            nest: true,
            replacements: {
                salepage_id: salePage[0].id,
            },
            type: Sequelize.SELECT
        });

        let packageProduct = [];
        if (salePage.length > 0) {
            packageProduct = await connectDb.query(`
            SELECT packages.*, packages.id AS pk_id
            FROM packages
            WHERE packages.salepage_id = :salepage_id
            LIMIT 1;
        `, {
                nest: true,
                replacements: {
                    salepage_id: salePage[0].id,
                },
                type: Sequelize.SELECT
            });
        }
        let package_detail = [];
        if (packageProduct && packageProduct.length > 0) {
            package_detail = await connectDb.query(`
              SELECT package_details.*, package_details.recommend_id AS rcm_id, recommends.name_recommend AS name_re
              FROM package_details
              JOIN recommends ON recommends.id = package_details.recommend_id
              WHERE package_details.package_id = :package_id;
            `, {
                nest: true,
                replacements: {
                    package_id: packageProduct[0].id,
                },
                type: Sequelize.SELECT
            });
        }
        return { pro: product[0], sale_page: salePage[0], salepage_detail, package: packageProduct[0], package_detail };
    } catch (error) {
        console.error(error);
        return { status: 'error', error: error };
    }
}

async function getOrderList(userId, search) {
    try {
        let orders = []
        if (search) {
            orders = await connectDb.query(`
                SELECT orders.*, products.name_product as name_product, products.detail_product as detail_product, products.img_product as img_product, products.id as pro_id
                FROM orders
                JOIN products ON products.id = orders.product_id
                WHERE orders.user_id = :userId AND products.name_product LIKE :search
            `, {
                nest: true,
                replacements: {
                    userId: userId,
                    search: `%${search}%`
                },
                type: Sequelize.SELECT
            });

        } else {
            orders = await connectDb.query(`
                SELECT orders.*, products.name_product as name_product, products.detail_product as detail_product, products.img_product as img_product, products.id as pro_id
                FROM orders
                JOIN products ON products.id = orders.product_id
                WHERE orders.user_id = :userId
                ORDER BY orders.id DESC
            `, {
                nest: true,
                replacements: {
                    userId: userId
                },
                type: Sequelize.SELECT
            });

        }
        return { orders };
    } catch (error) {
        console.error(error);
        return { status: 'error', error: error };
    }
}

async function getStock(userId, search, category_search) {
    try {
        let stocks = []
        if (search) {
            stocks = await connectDb.query(`
              SELECT orders.*,orders.created_at as createOrder, products.name_product as name_product, products.detail_product as detail_product, products.img_product as img_product, products.id as pro_id, package_details.*, products.category_id as category_id, products.qr_code_line as qrcode_line, products.link_line, products.line_id
              FROM orders
              JOIN products ON products.id = orders.product_id
              JOIN package_details ON package_details.id = orders.package_detail_id
              WHERE orders.user_id = :userId AND products.name_product LIKE :search
            `, {
                nest: true,
                replacements: {
                    userId: userId,
                    search: `%${search}%`
                },
                type: Sequelize.SELECT
            });
        } else if (category_search) {
            stocks = await connectDb.query(`
              SELECT orders.*,orders.created_at as createOrder, products.name_product as name_product, products.detail_product as detail_product, products.img_product as img_product, products.id as pro_id, package_details.*, products.category_id as category_id, products.qr_code_line as qrcode_line, products.link_line, products.line_id
              FROM orders
              JOIN products ON products.id = orders.product_id
              JOIN package_details ON package_details.id = orders.package_detail_id
              WHERE orders.user_id = :userId AND products.category_id LIKE :categorySearch
            `, {
                nest: true,
                replacements: {
                    userId: userId,
                    categorySearch: `%${category_search}%`
                },
                type: Sequelize.SELECT
            });
        } else {
            stocks = await connectDb.query(`
              SELECT orders.*,orders.created_at as createOrder, products.name_product as name_product, products.detail_product as detail_product, products.img_product as img_product, products.id as pro_id, package_details.*, products.category_id as category_id, products.qr_code_line as qrcode_line, products.link_line, products.line_id
              FROM orders
              JOIN products ON products.id = orders.product_id
              JOIN package_details ON package_details.id = orders.package_detail_id
              WHERE orders.user_id = :userId
            `, {
                nest: true,
                replacements: {
                    userId: userId
                },
                type: Sequelize.SELECT
            });
        }
        return { stocks };
    } catch (error) {
        console.error(error);
        return { status: 'error', error: error };
    }
}


export {
    getAllProduct,
    getOrderList,
    getProducts,
    salepageDetail,
    getStock
}
