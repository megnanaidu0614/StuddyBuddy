const User = require('../models/userModel');
const { findFolderByPath } = require('../services/folderHelpers');

const getFolders = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const classObj = user.classes.id(req.params.classId);
    if (!classObj) return res.status(404).json({ message: 'Class not found' });

    // folderPath as array in query, e.g. ?folderPath=folderId1,folderId2
    const folderPath = req.query.folderPath ? req.query.folderPath.split(',') : [];

    if (folderPath.length === 0) {
      // Top-level folders in the class
      return res.status(200).json(classObj.folders);
    } else {
      // Nested folders
      const parentFolder = findFolderByPath(classObj.folders, folderPath);
      if (!parentFolder) return res.status(404).json({ message: 'Parent folder not found' });
      return res.status(200).json(parentFolder.folders);
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const createFolder = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const classObj = user.classes.id(req.params.classId);
    if (!classObj) return res.status(404).json({ message: 'Class not found' });

    const folderPath = req.body.folderPath || []; // Array of folder IDs for nesting
    const newFolder = { name: req.body.name };

    if (folderPath.length === 0) {
      classObj.folders.push(newFolder);
    } else {
      const parentFolder = findFolderByPath(classObj.folders, folderPath);
      if (!parentFolder) return res.status(404).json({ message: 'Parent folder not found' });
      parentFolder.folders.push(newFolder);
    }

    await user.save();
    res.status(201).json(newFolder);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const updateFolder = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const classObj = user.classes.id(req.params.classId);
    if (!classObj) return res.status(404).json({ message: 'Class not found' });

    const folderPath = req.body.folderPath || [];
    let folder;
    if (folderPath.length === 0) {
      folder = classObj.folders.id(req.params.folderId);
    } else {
      const parentFolder = findFolderByPath(classObj.folders, folderPath);
      if (!parentFolder) return res.status(404).json({ message: 'Parent folder not found' });
      folder = parentFolder.folders.id(req.params.folderId);
    }
    if (!folder) return res.status(404).json({ message: 'Folder not found' });

    folder.name = req.body.name || folder.name;
    await user.save();
    res.status(200).json(folder);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteFolder = async (req, res) => {
  try {
    console.log('Delete folder request:', req.params.folderId, 'in class:', req.params.classId);
    console.log('Folder path:', req.body.folderPath);
    
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const classObj = user.classes.id(req.params.classId);
    if (!classObj) return res.status(404).json({ message: 'Class not found' });

    const folderPath = req.body.folderPath || [];
    let folderArr;
    if (folderPath.length === 0) {
      folderArr = classObj.folders;
    } else {
      const parentFolder = findFolderByPath(classObj.folders, folderPath);
      if (!parentFolder) return res.status(404).json({ message: 'Parent folder not found' });
      folderArr = parentFolder.folders;
    }
    const folder = folderArr.id(req.params.folderId);
    if (!folder) return res.status(404).json({ message: 'Folder not found' });

    console.log('Found folder to delete:', folder.name);
    
    // Remove the folder from the array
    if (folderPath.length === 0) {
      classObj.folders = classObj.folders.filter(folder => folder._id.toString() !== req.params.folderId);
    } else {
      const parentFolder = findFolderByPath(classObj.folders, folderPath);
      if (parentFolder) {
        parentFolder.folders = parentFolder.folders.filter(folder => folder._id.toString() !== req.params.folderId);
      }
    }
    await user.save();
    
    console.log('Folder deleted successfully');
    res.status(200).json({ message: 'Folder deleted successfully' });
  } catch (error) {
    console.error('Error deleting folder:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// Get all classes for the user
const getClasses = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json(user.classes);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Create a new class
const createClass = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const newClass = { name: req.body.name, folders: [] };
    user.classes.push(newClass);
    await user.save();
    res.status(201).json(newClass);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Update a class
const updateClass = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const classObj = user.classes.id(req.params.classId);
    if (!classObj) return res.status(404).json({ message: 'Class not found' });
    classObj.name = req.body.name || classObj.name;
    await user.save();
    res.status(200).json(classObj);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a class
const deleteClass = async (req, res) => {
  try {
    console.log('Delete class request:', req.params.classId);
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    const classObj = user.classes.id(req.params.classId);
    if (!classObj) return res.status(404).json({ message: 'Class not found' });
    
    console.log('Found class to delete:', classObj.name);
    
    // Remove the class from the array
    user.classes = user.classes.filter(cls => cls._id.toString() !== req.params.classId);
    await user.save();
    
    console.log('Class deleted successfully');
    res.status(200).json({ message: 'Class deleted successfully' });
  } catch (error) {
    console.error('Error deleting class:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};


module.exports = { getFolders, createFolder, updateFolder, deleteFolder, getClasses,
  createClass,
  updateClass,
  deleteClass, };