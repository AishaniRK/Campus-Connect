const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authenticate } = require('../middleware/authMiddleware');

router.get('/', authenticate, notificationController.getMyNotifications);
router.put('/read-all', authenticate, notificationController.markAllNotificationsRead);

module.exports = router;

