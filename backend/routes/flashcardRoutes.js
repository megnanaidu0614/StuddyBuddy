const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getFlashcardSets,
  getFlashcardSet,
  createFlashcardSet,
  updateFlashcardSet,
  deleteFlashcardSet,
  updateActiveRecallData,
  resetActiveRecallData,
  upload
} = require('../controllers/flashcardController');

router.use(protect);

// Flashcard set routes
router.get('/:classId/flashcardSets', getFlashcardSets);
router.get('/:classId/flashcardSets/:setId', getFlashcardSet);
router.post('/:classId/flashcardSets', createFlashcardSet);
router.put('/:classId/flashcardSets/:setId', updateFlashcardSet);
router.delete('/:classId/flashcardSets/:setId', deleteFlashcardSet);

// Active recall routes
router.post('/:classId/flashcardSets/:setId/activeRecall', updateActiveRecallData);
router.post('/:classId/flashcardSets/:setId/resetActiveRecall', resetActiveRecallData);

module.exports = router;