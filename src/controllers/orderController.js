const Order = require('../models/Order');
const Product = require('../models/Product');
const logActivity = require('../utils/logger');

exports.getOrders = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const total = await Order.countDocuments();
  const orders = await Order.find({})
    .populate('items.product', 'name')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  res.json({
    orders,
    page,
    pages: Math.ceil(total / limit),
    total,
  });
};

exports.getOrderById = async (req, res) => {
  const order = await Order.findById(req.params.id).populate('items.product', 'name');
  if (order) {
    res.json(order);
  } else {
    res.status(404).json({ message: 'Order not found' });
  }
};

exports.createOrder = async (req, res) => {
  const { customerName, items } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ message: 'No items in order' });
  }

  // Conflict Detection: Duplicate products
  const productIds = items.map((i) => i.product);
  if (new Set(productIds).size !== productIds.length) {
    return res.status(400).json({ message: 'Duplicate products in the same order.' });
  }

  let totalPrice = 0;
  const processedItems = [];

  for (const item of items) {
    const product = await Product.findById(item.product);

    if (!product) {
      return res.status(404).json({ message: `Product not found: ${item.product}` });
    }

    // Role: Prevent ordering inactive products
    if (product.status === 'Out of Stock') {
      return res.status(400).json({ message: `Product "${product.name}" is currently unavailable.` });
    }

    // Stock Validation
    if (product.stock < item.quantity) {
      return res.status(400).json({ message: `Only ${product.stock} items available for "${product.name}"` });
    }

    totalPrice += product.price * item.quantity;
    processedItems.push({
      product: product._id,
      quantity: item.quantity,
      priceAtOrder: product.price,
    });

    // Stock Deduction
    product.stock -= item.quantity;
    await product.save();
    
    // Automatically add to Restock Queue if below threshold
    if (product.stock <= product.threshold) {
       await logActivity(`Product "${product.name}" added to Restock Queue (Stock: ${product.stock})`, 'Stock');
    }
  }

  const order = await Order.create({
    customerName,
    items: processedItems,
    totalPrice,
  });

  if (order) {
    await logActivity(`Order #${order._id.toString().slice(-6)} created for "${customerName}"`, 'Order');
    res.status(201).json(order);
  } else {
    res.status(400).json({ message: 'Invalid order data' });
  }
};

exports.updateOrderStatus = async (req, res) => {
  const { status } = req.body;
  const order = await Order.findById(req.params.id);

  if (order) {
    const prevStatus = order.status;
    order.status = status || order.status;

    // Handle Cancelled order: Add stock back
    if (status === 'Cancelled' && prevStatus !== 'Cancelled') {
      for (const item of order.items) {
        const product = await Product.findById(item.product);
        if (product) {
          product.stock += item.quantity;
          await product.save();
        }
      }
    }

    const updatedOrder = await order.save();
    await logActivity(`Order #${order._id.toString().slice(-6)} marked as ${status}`, 'Order');
    res.json(updatedOrder);
  } else {
    res.status(404).json({ message: 'Order not found' });
  }
};
