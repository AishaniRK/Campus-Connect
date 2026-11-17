const express = require('express');
const router = express.Router();
const opportunityController = require('../controllers/opportunityController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// Opportunities listing and details
router.get('/', authenticate, opportunityController.getAllOpportunities);
router.get('/categories', authenticate, opportunityController.getOpportunityCategories);
router.get('/recommended', authenticate, authorize(['student']), opportunityController.getRecommendedOpportunities);
router.get('/saved', authenticate, authorize(['student']), opportunityController.getSavedOpportunities);
router.get('/:id', authenticate, opportunityController.getOpportunityById);

// Student bookmarking
router.post('/:id/save', authenticate, authorize(['student']), opportunityController.saveOpportunity);
router.delete('/:id/save', authenticate, authorize(['student']), opportunityController.unsaveOpportunity);

// Admin CRUD
router.post('/', authenticate, authorize(['admin']), opportunityController.createOpportunity);
router.put('/:id', authenticate, authorize(['admin']), opportunityController.updateOpportunity);
router.delete('/:id', authenticate, authorize(['admin']), opportunityController.deleteOpportunity);

module.exports = router;
