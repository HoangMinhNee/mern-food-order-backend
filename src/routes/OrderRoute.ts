import express from "express";
import { jwtCheck, jwtParse } from "../middleware/auth";
import OrderController from "../controller/OrderController";

const router = express.Router();

// Lấy danh sách đơn hàng của người dùng
router.get("/", jwtCheck, jwtParse, OrderController.getMyOrders);

// Route mới để tạo đơn hàng (thay vì tạo session Stripe)
router.post("/create", jwtCheck, jwtParse, OrderController.createOrder);

export default router;
