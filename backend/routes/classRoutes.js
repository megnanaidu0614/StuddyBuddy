const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

const {
  getClasses,
  createClass,
  updateClass,
  deleteClass,
  getFolders,        
  createFolder,     
  updateFolder,       
  deleteFolder,       
} = require('../controllers/classesController');



router.use(protect);

// Define the routes
router.get('/', getClasses);
router.post('/', createClass);        
router.put('/:classId', updateClass);  
router.delete('/:classId', deleteClass); 

router.get('/:classId/folders', getFolders);
router.post('/:classId/folders', createFolder);
router.put('/:classId/folders/:folderId', updateFolder);
router.delete('/:classId/folders/:folderId', deleteFolder);



// Export the router
module.exports = router;