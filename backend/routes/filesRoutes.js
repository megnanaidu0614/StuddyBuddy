const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

const {
  getFiles,
  createFile,
  updateFile,
  deleteFile      
} = require('../controllers/filesController');

router.use(protect);

// Define the routes
router.get('/:classId/files', getFiles);
router.post('/:classId/files', createFile);
router.put('/:classId/files/:fileId', updateFile);
router.delete('/:classId/files/:fileId', deleteFile); 

// Export the router
module.exports = router;