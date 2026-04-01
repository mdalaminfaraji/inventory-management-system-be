const ActivityLog = require('../models/ActivityLog');

const logActivity = async (message, type = 'Product') => {
  try {
    await ActivityLog.create({ message, type });
  } catch (error) {
    console.error('Logging Error:', error);
  }
};

module.exports = logActivity;
