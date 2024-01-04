// controllers/orderController.js

import asyncHandler from '../middleware/asyncHandler.js';
import Order from '../models/orderModel.js';
import Product from '../models/productModel.js';
import { calcPrices } from '../utils/calcPrices.js';
import { verifyPayPalPayment } from '../utils/paypal.js';
import { checkIfNewTransaction } from '../utils/transactionUtils.js';

const addOrderItems = asyncHandler(async (req, res, next) => {
  try {
    console.log('Received order creation request:', req.body);

    const { orderItems, shippingAddress, paymentMethod } = req.body;

    if (!orderItems || orderItems.length === 0) {
      res.status(400);
      throw new Error('No order items');
    }

    const orderItemsWithValidIds = orderItems.filter((item) => item._id);

    if (orderItemsWithValidIds.length !== orderItems.length) {
      console.error('Some order items have undefined _id');
      res.status(400);
      throw new Error('Some order items have undefined _id');
    }

    if (orderItemsWithValidIds.length === 0) {
      console.error('No valid order items found');
      res.status(400);
      throw new Error('No valid order items found');
    }

    const itemsFromDB = await Product.find({
      _id: { $in: orderItemsWithValidIds.map((x) => x._id) },
    });

    if (itemsFromDB.length !== orderItemsWithValidIds.length) {
      console.error('Some order items do not match existing products');
      res.status(400);
      throw new Error('Some order items do not match existing products');
    }

    const dbOrderItems = orderItems.map((itemFromClient) => {
      const matchingItemFromDB = itemsFromDB.find(
        (itemFromDB) => itemFromDB._id.toString() === itemFromClient._id.toString()
      );

      if (!matchingItemFromDB) {
        console.error(`Product not found for order item with ID: ${itemFromClient._id}`);
        res.status(404);
        throw new Error(`Product not found for order item with ID: ${itemFromClient._id}`);
      }

      return {
        ...itemFromClient,
        product: matchingItemFromDB._id,
        price: matchingItemFromDB.price,
        discount: matchingItemFromDB.discount || 0,
      };
    });

    const { itemsPrice, taxPrice, shippingPrice, totalPrice } = calcPrices(dbOrderItems);

    const order = new Order({
      orderItems: dbOrderItems,
      user: req.user._id,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    });

    const createdOrder = await order.save();

    console.log('Order created successfully:', createdOrder);
    res.status(201).json(createdOrder);
  } catch (error) {
    console.error('Error creating order:', error.message);
    next(error);
  }
});

const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id });
  res.json(orders);
});

const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');

  if (order) {
    res.json(order);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

const updateOrderToPaid = asyncHandler(async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      order.isPaid = true;
      order.deliveredAt = Date.now();

      const updatedOrder = await order.save();

      res.json(updatedOrder);
    } else {
      res.status(404);
      throw new Error('Order not found');
    }
  } catch (error) {
    return next(error);
  }
});

const updateOrderToDelivered = asyncHandler(async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      order.isDelivered = true;
      order.deliveredAt = Date.now();

      const updatedOrder = await order.save();

      res.json(updatedOrder);
    } else {
      res.status(404);
      throw new Error('Order not found');
    }
  } catch (error) {
    return next(error);
  }
});

const getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({}).populate('user', 'id name');
  res.json(orders);
});
const payOnDelivery = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    order.isPaidOnDelivery = true;
    order.paidOnDeliveryAt = Date.now();

    const updatedOrder = await order.save();

    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});


export {
  addOrderItems,
  payOnDelivery,
  getMyOrders,
  getOrderById,
  updateOrderToPaid,
  updateOrderToDelivered,
  getOrders,
};
