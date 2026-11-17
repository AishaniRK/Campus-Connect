const express = require('express');
const router = express.Router();
const complaintController = require('../controllers/complaintController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Student complaint submission
router.post('/', authenticate, authorize(['student']), upload.single('image'), complaintController.submitComplaint);

// Student's personal complaints & duplicate reports
router.get('/my', authenticate, authorize(['student']), complaintController.getMyComplaints);

// Supporting reference categories & departments
router.get('/categories', authenticate, complaintController.getIssueCategories);
router.get('/departments', authenticate, complaintController.getDepartments);

// All complaints (Admin access)
router.get('/', authenticate, authorize(['admin']), complaintController.getAllComplaints);

// Specific complaint detail (Owner student or Admin)
router.get('/:id', authenticate, complaintController.getComplaintById);

// Admin actions
router.put('/:id/status', authenticate, authorize(['admin']), complaintController.updateComplaintStatus);
router.put('/:id/priority', authenticate, authorize(['admin']), complaintController.updateComplaintPriority);
router.put('/:id/assign', authenticate, authorize(['admin']), complaintController.assignDepartment);

module.exports = router;
