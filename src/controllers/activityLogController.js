const ActivityLog = require('../models/ActivityLog');

exports.getActivityLogs = async (req, res) => {
  const logs = await ActivityLog.find({}).sort({ createdAt: -1 }).limit(10);
  res.json(logs);
};
