const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { analyzeFeynmanExplanation, testGeminiAPI } = require('../controllers/feynmanController');

router.use(protect);

// Test Gemini API
router.get('/test', testGeminiAPI);

// Analyze Feynman explanation
router.post('/analyze', analyzeFeynmanExplanation);

module.exports = router; 