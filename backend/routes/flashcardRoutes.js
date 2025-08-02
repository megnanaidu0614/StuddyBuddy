const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

const {
  getFlashcards,
  createFlashcard,
  updateFlashcard,
  deleteFlashcard      
} = require('../controllers/flashcardsController');

router.use(protect);

// Define the routes
router.get('/', getFlashcards);
router.post('/', createFlashcard);        
router.put('/:classId', updateFlashcard);  
router.delete('/:classId', deleteFlashcard); 

// Export the router
module.exports = router;