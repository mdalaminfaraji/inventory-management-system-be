const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    price: { type: Number, required: true },
    stock: { type: Number, required: true, default: 0 },
    threshold: { type: Number, required: true, default: 5 },
    status: { type: String, enum: ['Active', 'Out of Stock'], default: 'Active' },
  },
  { timestamps: true }
);

// Automatically set status to Out of Stock if stock is 0
productSchema.pre('save', function () {
  if (this.stock === 0) {
    this.status = 'Out of Stock';
  } else if (this.stock > 0 && this.status === 'Out of Stock') {
    this.status = 'Active';
  }
});

module.exports = mongoose.model('Product', productSchema);
