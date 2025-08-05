const User = require('../models/userModel');
const { findFolderByPath } = require('../services/folderHelpers');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/flashcards/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'flashcard-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Get all flashcard sets for a class
const getFlashcardSets = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const classObj = user.classes.id(req.params.classId);
    if (!classObj) return res.status(404).json({ message: 'Class not found' });

    const folderPath = req.query.folderPath ? req.query.folderPath.split(',') : [];
    
    if (folderPath.length === 0) {
      return res.status(200).json(classObj.flashcardSets);
    } else {
      const folder = findFolderByPath(classObj.folders, folderPath);
      if (!folder) return res.status(404).json({ message: 'Folder not found' });
      return res.status(200).json(folder.flashcardSets || []);
    }
  } catch (error) {
    console.error('Error getting flashcard sets:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get a single flashcard set
const getFlashcardSet = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const classObj = user.classes.id(req.params.classId);
    if (!classObj) return res.status(404).json({ message: 'Class not found' });

    // First check in root level
    let flashcardSet = classObj.flashcardSets.id(req.params.setId);
    
    // If not found in root, search in all folders
    if (!flashcardSet) {
      const searchInFolders = (folders) => {
        for (const folder of folders) {
          if (folder.flashcardSets) {
            const found = folder.flashcardSets.id(req.params.setId);
            if (found) return found;
          }
          if (folder.folders && folder.folders.length > 0) {
            const found = searchInFolders(folder.folders);
            if (found) return found;
          }
        }
        return null;
      };
      
      flashcardSet = searchInFolders(classObj.folders);
    }

    if (!flashcardSet) return res.status(404).json({ message: 'Flashcard set not found' });

    res.status(200).json(flashcardSet);
  } catch (error) {
    console.error('Error getting flashcard set:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create a new flashcard set
const createFlashcardSet = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const classObj = user.classes.id(req.params.classId);
    if (!classObj) return res.status(404).json({ message: 'Class not found' });

    const { title, description, cards } = req.body;
    const folderPath = req.body.folderPath || [];

    if (!title || !cards || !Array.isArray(cards)) {
      return res.status(400).json({ message: 'Title and cards array are required' });
    }

    const newFlashcardSet = {
      title,
      description: description || '',
      cards: cards.map(card => ({
        front: card.front,
        back: card.back,
        frontImage: card.frontImage || null,
        backImage: card.backImage || null,
        frontMath: card.frontMath || null,
        backMath: card.backMath || null
      })),
      activeRecallData: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    if (folderPath.length === 0) {
      classObj.flashcardSets.push(newFlashcardSet);
    } else {
      const folder = findFolderByPath(classObj.folders, folderPath);
      if (!folder) return res.status(404).json({ message: 'Folder not found' });
      if (!folder.flashcardSets) folder.flashcardSets = [];
      folder.flashcardSets.push(newFlashcardSet);
    }

    await user.save();
    res.status(201).json(newFlashcardSet);
  } catch (error) {
    console.error('Error creating flashcard set:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update a flashcard set
const updateFlashcardSet = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const classObj = user.classes.id(req.params.classId);
    if (!classObj) return res.status(404).json({ message: 'Class not found' });

    const { title, description, cards } = req.body;
    
    // First check in root level
    let flashcardSet = classObj.flashcardSets.id(req.params.setId);
    
    // If not found in root, search in all folders
    if (!flashcardSet) {
      const searchInFolders = (folders) => {
        for (const folder of folders) {
          if (folder.flashcardSets) {
            const found = folder.flashcardSets.id(req.params.setId);
            if (found) return found;
          }
          if (folder.folders && folder.folders.length > 0) {
            const found = searchInFolders(folder.folders);
            if (found) return found;
          }
        }
        return null;
      };
      
      flashcardSet = searchInFolders(classObj.folders);
    }

    if (!flashcardSet) return res.status(404).json({ message: 'Flashcard set not found' });

    if (title) flashcardSet.title = title;
    if (description !== undefined) flashcardSet.description = description;
    if (cards && Array.isArray(cards)) {
      flashcardSet.cards = cards.map(card => ({
        front: card.front,
        back: card.back,
        frontImage: card.frontImage || null,
        backImage: card.backImage || null,
        frontMath: card.frontMath || null,
        backMath: card.backMath || null
      }));
    }
    flashcardSet.updatedAt = new Date();

    await user.save();
    res.status(200).json(flashcardSet);
  } catch (error) {
    console.error('Error updating flashcard set:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a flashcard set
const deleteFlashcardSet = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const classObj = user.classes.id(req.params.classId);
    if (!classObj) return res.status(404).json({ message: 'Class not found' });

    // First check in root level
    let flashcardSet = classObj.flashcardSets.id(req.params.setId);
    let isInRoot = true;
    
    // If not found in root, search in all folders
    if (!flashcardSet) {
      isInRoot = false;
      const searchInFolders = (folders) => {
        for (const folder of folders) {
          if (folder.flashcardSets) {
            const found = folder.flashcardSets.id(req.params.setId);
            if (found) return { flashcardSet: found, folder };
          }
          if (folder.folders && folder.folders.length > 0) {
            const result = searchInFolders(folder.folders);
            if (result) return result;
          }
        }
        return null;
      };
      
      const result = searchInFolders(classObj.folders);
      if (result) {
        flashcardSet = result.flashcardSet;
        const folder = result.folder;
        // Remove from the specific folder
        folder.flashcardSets = folder.flashcardSets.filter(set => set._id.toString() !== req.params.setId);
      }
    }

    if (!flashcardSet) return res.status(404).json({ message: 'Flashcard set not found' });

    // Remove the flashcard set from root if it's there
    if (isInRoot) {
      classObj.flashcardSets = classObj.flashcardSets.filter(set => set._id.toString() !== req.params.setId);
    }

    await user.save();
    res.status(200).json({ message: 'Flashcard set deleted successfully' });
  } catch (error) {
    console.error('Error deleting flashcard set:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update active recall data
const updateActiveRecallData = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const classObj = user.classes.id(req.params.classId);
    if (!classObj) return res.status(404).json({ message: 'Class not found' });

    const { cardId, knowledgeLevel } = req.body;
    
    // First check in root level
    let flashcardSet = classObj.flashcardSets.id(req.params.setId);
    
    // If not found in root, search in all folders
    if (!flashcardSet) {
      const searchInFolders = (folders) => {
        for (const folder of folders) {
          if (folder.flashcardSets) {
            const found = folder.flashcardSets.id(req.params.setId);
            if (found) return found;
          }
          if (folder.folders && folder.folders.length > 0) {
            const found = searchInFolders(folder.folders);
            if (found) return found;
          }
        }
        return null;
      };
      
      flashcardSet = searchInFolders(classObj.folders);
    }

    if (!flashcardSet) return res.status(404).json({ message: 'Flashcard set not found' });

    // Find or create active recall data for this card
    let recallData = flashcardSet.activeRecallData.find(data => data.cardId.toString() === cardId);
    if (!recallData) {
      recallData = {
        cardId: cardId,
        knowledgeLevel: 0,
        lastReviewed: new Date(),
        reviewCount: 0
      };
      flashcardSet.activeRecallData.push(recallData);
    }

    recallData.knowledgeLevel = Math.max(0, Math.min(5, knowledgeLevel));
    recallData.lastReviewed = new Date();
    recallData.reviewCount += 1;

    await user.save();
    res.status(200).json(recallData);
  } catch (error) {
    console.error('Error updating active recall data:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Reset active recall data for a set
const resetActiveRecallData = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const classObj = user.classes.id(req.params.classId);
    if (!classObj) return res.status(404).json({ message: 'Class not found' });

    // First check in root level
    let flashcardSet = classObj.flashcardSets.id(req.params.setId);
    
    // If not found in root, search in all folders
    if (!flashcardSet) {
      const searchInFolders = (folders) => {
        for (const folder of folders) {
          if (folder.flashcardSets) {
            const found = folder.flashcardSets.id(req.params.setId);
            if (found) return found;
          }
          if (folder.folders && folder.folders.length > 0) {
            const found = searchInFolders(folder.folders);
            if (found) return found;
          }
        }
        return null;
      };
      
      flashcardSet = searchInFolders(classObj.folders);
    }

    if (!flashcardSet) return res.status(404).json({ message: 'Flashcard set not found' });

    // Reset all active recall data
    flashcardSet.activeRecallData = [];

    await user.save();
    res.status(200).json({ message: 'Active recall data reset successfully' });
  } catch (error) {
    console.error('Error resetting active recall data:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getFlashcardSets,
  getFlashcardSet,
  createFlashcardSet,
  updateFlashcardSet,
  deleteFlashcardSet,
  updateActiveRecallData,
  resetActiveRecallData,
  upload
}; 