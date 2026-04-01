const express = require('express');
const { getProducts, getProductById, createProduct, updateProduct, deleteProduct, getLowStockProducts } = require('../controllers/productController');
const { protect, admin } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', protect, getProducts);
router.get('/low-stock', protect, getLowStockProducts);
router.get('/:id', protect, getProductById);
router.post('/', protect, admin, createProduct);
router.put('/:id', protect, admin, updateProduct);
router.delete('/:id', protect, admin, deleteProduct);

module.exports = router;
