import { Request, Response } from "express";
import Restaurant, { MenuItemType } from "../models/restaurant";
import Order from "../models/order";

const FRONTEND_URL = process.env.FRONTEND_URL as string;

const getMyOrders = async (req: Request, res: Response) => {
  try {
    const orders = await Order.find({ user: req.userId })
      .populate("restaurant")
      .populate("user");

    res.json(orders);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "something went wrong" });
  }
};

type CreateOrderRequest = {
  cartItems: {
    menuItemId: string;
    name: string;
    quantity: string;
  }[];
  deliveryDetails: {
    email: string;
    name: string;
    addressLine1: string;
    city: string;
  };
  restaurantId: string;
};

const createOrder = async (req: Request, res: Response) => {
  try {
    const createOrderRequest: CreateOrderRequest = req.body;

    // Tìm kiếm nhà hàng
    const restaurant = await Restaurant.findById(
      createOrderRequest.restaurantId
    );

    if (!restaurant) {
      throw new Error("Restaurant not found");
    }

    // Tạo đơn hàng mới
    const newOrder = new Order({
      restaurant: restaurant,
      user: req.userId, // Lấy thông tin người dùng từ token đã xác thực
      status: "placed", // Đặt trạng thái đơn hàng là "placed"
      deliveryDetails: createOrderRequest.deliveryDetails,
      cartItems: createOrderRequest.cartItems,
      totalAmount: calculateTotalAmount(
        createOrderRequest.cartItems,
        restaurant.menuItems
      ),
      createdAt: new Date(),
    });

    await newOrder.save();

    res.json({ message: "Order created successfully", order: newOrder });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

// Hàm tính tổng tiền của đơn hàng dựa trên giỏ hàng và giá món ăn
const calculateTotalAmount = (
  cartItems: CreateOrderRequest["cartItems"],
  menuItems: any[]
) => {
  let totalAmount = 0;

  cartItems.forEach((cartItem) => {
    const menuItem = menuItems.find(
      (item) => item._id.toString() === cartItem.menuItemId
    );

    if (menuItem) {
      totalAmount += menuItem.price * parseInt(cartItem.quantity);
    }
  });

  return totalAmount;
};

export default {
  getMyOrders,
  createOrder,
};
