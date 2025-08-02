const User = require('../models/userModel');
const { findFolderByPath } = require('../services/folderHelpers');

// GET flashcards (in class or nested folder)
const getFlashcards = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const classObj = user.classes.id(req.params.classId);
    if (!classObj) return res.status(404).json({ message: 'Class not found' });

    const folderPath = req.query.folderPath ? req.query.folderPath.split(',') : [];
    if (folderPath.length === 0) {
      return res.status(200).json(classObj.flashcards || []);
    } else {
      const folder = findFolderByPath(classObj.folders, folderPath);
      if (!folder) return res.status(404).json({ message: 'Folder not found' });
      return res.status(200).json(folder.flashcards || []);
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// CREATE flashcard (in class or nested folder)
const createFlashcard = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const classObj = user.classes.id(req.params.classId);
    if (!classObj) return res.status(404).json({ message: 'Class not found' });

    const folderPath = req.body.folderPath || [];
    const newFlashcard = {
      question: req.body.question,
      answer: req.body.answer,
      // Add more fields as needed
    };

    if (folderPath.length === 0) {
      classObj.flashcards = classObj.flashcards || [];
      classObj.flashcards.push(newFlashcard);
    } else {
      const folder = findFolderByPath(classObj.folders, folderPath);
      if (!folder) return res.status(404).json({ message: 'Folder not found' });
      folder.flashcards = folder.flashcards || [];
      folder.flashcards.push(newFlashcard);
    }

    await user.save();
    res.status(201).json(newFlashcard);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// UPDATE flashcard (in class or nested folder)
const updateFlashcard = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const classObj = user.classes.id(req.params.classId);
    if (!classObj) return res.status(404).json({ message: 'Class not found' });

    const folderPath = req.body.folderPath || [];
    let flashcard;

    if (folderPath.length === 0) {
      flashcard = (classObj.flashcards || []).id(req.params.flashcardId);
    } else {
      const folder = findFolderByPath(classObj.folders, folderPath);
      if (!folder) return res.status(404).json({ message: 'Folder not found' });
      flashcard = (folder.flashcards || []).id(req.params.flashcardId);
    }

    if (!flashcard) return res.status(404).json({ message: 'Flashcard not found' });

    flashcard.question = req.body.question || flashcard.question;
    flashcard.answer = req.body.answer || flashcard.answer;
    // Update more fields as needed

    await user.save();
    res.status(200).json(flashcard);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE flashcard (in class or nested folder)
const deleteFlashcard = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const classObj = user.classes.id(req.params.classId);
    if (!classObj) return res.status(404).json({ message: 'Class not found' });

    const folderPath = req.body.folderPath || [];
    let flashcardsArr;

    if (folderPath.length === 0) {
      flashcardsArr = classObj.flashcards;
    } else {
      const folder = findFolderByPath(classObj.folders, folderPath);
      if (!folder) return res.status(404).json({ message: 'Folder not found' });
      flashcardsArr = folder.flashcards;
    }

    const flashcard = flashcardsArr.id(req.params.flashcardId);
    if (!flashcard) return res.status(404).json({ message: 'Flashcard not found' });

    flashcard.remove();
    await user.save();
    res.status(200).json({ message: 'Flashcard deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getFlashcards,
  createFlashcard,
  updateFlashcard,
  deleteFlashcard,
};