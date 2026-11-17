const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staffController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.get('/dashboard', authenticate, authorize(['staff']), staffController.getStaffDashboard);
router.get('/high-priority', authenticate, authorize(['staff']), staffController.getHighPriorityComplaints);
router.get('/resolved', authenticate, authorize(['staff']), staffController.getResolvedComplaints);

module.exports = router;

