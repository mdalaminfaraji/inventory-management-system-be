const Product = require('../models/Product');
const logActivity = require('../utils/logger');

exports.getProducts = async (req, res) => {
  const products = await Product.find({}).populate('category', 'name');
  res.json(products);
};

exports.getProductById = async (req, res) => {
  const product = await Product.findById(req.params.id).populate('category', 'name');
  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ message: 'Product not found' });
  }
};

exports.createProduct = async (req, res) => {
  const { name, category, price, stock, threshold } = req.body;
  const product = await Product.create({ name, category, price, stock, threshold });

  if (product) {
    await logActivity(`Product "${name}" added by user`, 'Product');
    res.status(201).json(product);
  } else {
    res.status(400).json({ message: 'Invalid product data' });
  }
};

exports.updateProduct = async (req, res) => {
  const { name, category, price, stock, threshold } = req.body;
  const product = await Product.findById(req.params.id);

  if (product) {
    const prevStock = product.stock;
    product.name = name || product.name;
    product.category = category || product.category;
    product.price = price || product.price;
    product.stock = stock !== undefined ? stock : product.stock;
    product.threshold = threshold !== undefined ? threshold : product.threshold;

    const updatedProduct = await product.save();

    if (prevStock !== updatedProduct.stock) {
      await logActivity(`Stock updated for "${updatedProduct.name}" from ${prevStock} to ${updatedProduct.stock}`, 'Stock');
    }

    res.json(updatedProduct);
  } else {
    res.status(404).json({ message: 'Product not found' });
  }
};

exports.deleteProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    await product.deleteOne();
    await logActivity(`Product "${product.name}" deleted`, 'Product');
    res.json({ message: 'Product removed' });
  } else {
    res.status(404).json({ message: 'Product not found' });
  }
};

exports.getLowStockProducts = async (req, res) => {
  const products = await Product.find({
    $expr: { $lte: ['$stock', '$threshold'] },
  }).populate('category', 'name');
  res.json(products);
};
