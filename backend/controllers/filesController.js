const User = require('../models/userModel');
const { findFolderByPath } = require('../services/folderHelpers');


const getFiles = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const classObj = user.classes.id(req.params.classId);
    if (!classObj) return res.status(404).json({ message: 'Class not found' });

    const folderPath = req.query.folderPath ? req.query.folderPath.split(',') : [];
    if (folderPath.length === 0) {
      return res.status(200).json(classObj.files);
    } else {
      const folder = findFolderByPath(classObj.folders, folderPath);
      if (!folder) return res.status(404).json({ message: 'Folder not found' });
      return res.status(200).json(folder.files);
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const createFile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const classObj = user.classes.id(req.params.classId);
    if (!classObj) return res.status(404).json({ message: 'Class not found' });

    const folderPath = req.body.folderPath || [];
    const newFile = { name: req.body.name };

    if (folderPath.length === 0) {
      classObj.files.push(newFile);
    } else {
      const folder = findFolderByPath(classObj.folders, folderPath);
      if (!folder) return res.status(404).json({ message: 'Folder not found' });
      folder.files.push(newFile);
    }

    await user.save();
    res.status(201).json(newFile);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const updateFile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const classObj = user.classes.id(req.params.classId);
    if (!classObj) return res.status(404).json({ message: 'Class not found' });

    const folderPath = req.body.folderPath || [];
    let file;

    if (folderPath.length === 0) {
      file = classObj.files.id(req.params.fileId);
    } else {
      const folder = findFolderByPath(classObj.folders, folderPath);
      if (!folder) return res.status(404).json({ message: 'Folder not found' });
      file = folder.files.id(req.params.fileId);
    }

    if (!file) return res.status(404).json({ message: 'File not found' });

    file.name = req.body.name || file.name;
    // Add more fields to update as needed

    await user.save();
    res.status(200).json(file);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteFile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const classObj = user.classes.id(req.params.classId);
    if (!classObj) return res.status(404).json({ message: 'Class not found' });

    const folderPath = req.body.folderPath || [];
    let filesArr;

    if (folderPath.length === 0) {
      filesArr = classObj.files;
    } else {
      const folder = findFolderByPath(classObj.folders, folderPath);
      if (!folder) return res.status(404).json({ message: 'Folder not found' });
      filesArr = folder.files;
    }

    const file = filesArr.id(req.params.fileId);
    if (!file) return res.status(404).json({ message: 'File not found' });

    file.remove();
    await user.save();
    res.status(200).json({ message: 'File deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getFiles, createFile, updateFile, deleteFile };

