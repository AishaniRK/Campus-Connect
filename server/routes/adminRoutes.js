const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(authenticate, authorize(['admin']));

// Analytics Overview
router.get('/overview', adminController.getAdminOverview);

// User / Student Management
router.get('/users', adminController.getAllUsers);
router.put('/users/:id/status', adminController.updateUserStatus);

// Department Management
router.post('/departments', adminController.createDepartment);
router.put('/departments/:id', adminController.updateDepartment);
router.delete('/departments/:id', adminController.deleteDepartment);

// Issue Category Keyword Mappings
router.put('/categories/:id', adminController.updateIssueCategory);

module.exports = router;
