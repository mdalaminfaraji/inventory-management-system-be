const express = require('express');
const { getActivityLogs } = require('../controllers/activityLogController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', protect, getActivityLogs);

module.exports = router;
