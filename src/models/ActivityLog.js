const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema(
  {
    message: { type: String, required: true },
    type: { type: String, enum: ['Order', 'Product', 'Stock', 'User'], default: 'Product' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ActivityLog', activityLogSchema);
