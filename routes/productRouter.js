
const productRouter = express.Router();
import { getAllProduct, getProducts, salepageDetail, getOrderList, getStock } from '../controller/productsController.js';
import path from 'path'
import express from 'express';
import multer from "multer";

productRouter.get('/getAllProduct', async function (req, res) {
    try {
        const response = await getAllProduct()
        res.json(response)
    } catch (error) {
        console.log(error)
    }
});
productRouter.post('/getProducts', async function (req, res) {
    try {
        const { category_id, type, tag_special } = req.body;
        const response = await getProducts(category_id, type, tag_special)
        res.json(response)
    } catch (error) {
        console.log(error)
    }
});
productRouter.get('/salepageDetail', async function (req, res) {
    try {
        const { id } = req.query;
        const response = await salepageDetail(id)
        res.json(response)
    } catch (error) {
        console.log(error)
    }
});

productRouter.post('/getOrderList', async function (req, res) {
    try {
        const { user_id, searchKeywords } = req.body;
        const response = await getOrderList(user_id, searchKeywords)
        res.json(response)
    } catch (error) {
        console.log(error)
    }
});
productRouter.post('/getStock', async function (req, res) {
    try {
        const { user_id, search, category_search } = req.body;
        const response = await getStock(user_id, search, category_search)
        res.json(response)
    } catch (error) {
        console.log(error)
    }
});




export { productRouter };