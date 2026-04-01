const Order = require('../models/Order');
const Product = require('../models/Product');

exports.getDashboardStats = async (req, res) => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const totalOrdersToday = await Order.countDocuments({
    createdAt: { $gte: startOfDay },
  });

  const pendingOrders = await Order.countDocuments({ status: 'Pending' });
  const completedOrders = await Order.countDocuments({ status: 'Delivered' });

  const lowStockProductsCount = await Product.countDocuments({
    $expr: { $lte: ['$stock', '$threshold'] },
  });

  const ordersToday = await Order.find({
    createdAt: { $gte: startOfDay },
    status: { $ne: 'Cancelled' },
  });

  const revenueToday = ordersToday.reduce((total, order) => total + order.totalPrice, 0);

  res.json({
    totalOrdersToday,
    pendingOrders,
    completedOrders,
    lowStockProductsCount,
    revenueToday,
  });
};
