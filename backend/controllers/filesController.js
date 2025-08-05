const User = require('../models/userModel');
const { findFolderByPath } = require('../services/folderHelpers');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    console.log('Multer fileFilter called with file:', file);
    // Allow all file types for now
    cb(null, true);
  }
});


const getFiles = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
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
    console.log('=== CREATE FILE REQUEST DEBUG ===');
    console.log('Request method:', req.method);
    console.log('Request URL:', req.url);
    console.log('Request headers:', req.headers);
    console.log('Request content-type:', req.get('Content-Type'));
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);
    console.log('Request files:', req.files);
    console.log('Request params:', req.params);
    console.log('Request query:', req.query);
    console.log('=== END DEBUG ===');
    
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const classObj = user.classes.id(req.params.classId);
    if (!classObj) return res.status(404).json({ message: 'Class not found' });

    let folderPath = req.body.folderPath || [];
    
    // Handle folderPath if it's sent as a JSON string
    if (typeof folderPath === 'string') {
      try {
        folderPath = JSON.parse(folderPath);
      } catch (e) {
        console.log('Error parsing folderPath:', e);
        folderPath = [];
      }
    }
    
    console.log('Processed folderPath:', folderPath);
    
    // Validate that we have either a file or a name
    console.log('Validation check - req.file:', !!req.file, 'req.body.name:', req.body.name);
    if (!req.file && (!req.body.name || req.body.name.trim() === '')) {
      return res.status(400).json({ message: 'Either a file or a name must be provided' });
    }
    
    // Handle file upload
    let newFile = { 
      name: '',
      type: req.body.type || 'file',
      content: req.body.content || '',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // If file was uploaded
    if (req.file) {
      newFile.originalName = req.file.originalname;
      newFile.filePath = req.file.path;
      newFile.fileSize = req.file.size;
      newFile.mimeType = req.file.mimetype;
      
          // Set name - use provided name or original filename
    newFile.name = req.body.name || req.file.originalname;
    console.log('File uploaded, name set to:', newFile.name);
  } else {
    // If no file uploaded, use provided name
    newFile.name = req.body.name || 'Untitled File';
    console.log('No file uploaded, name set to:', newFile.name);
  }

    if (folderPath.length === 0) {
      classObj.files.push(newFile);
    } else {
      const folder = findFolderByPath(classObj.folders, folderPath);
      if (!folder) return res.status(404).json({ message: 'Folder not found' });
      folder.files.push(newFile);
    }

    console.log('About to save user with new file:', newFile);
    await user.save();
    console.log('User saved successfully');
    res.status(201).json(newFile);
  } catch (error) {
    console.error('Error creating file:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

const updateFile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const classObj = user.classes.id(req.params.classId);
    if (!classObj) return res.status(404).json({ message: 'Class not found' });

    let folderPath = req.body.folderPath || [];
    
    // Handle folderPath if it's sent as a JSON string
    if (typeof folderPath === 'string') {
      try {
        folderPath = JSON.parse(folderPath);
      } catch (e) {
        folderPath = [];
      }
    }
    
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
    file.type = req.body.type || file.type;
    file.content = req.body.content !== undefined ? req.body.content : file.content;
    file.updatedAt = new Date();

    await user.save();
    res.status(200).json(file);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteFile = async (req, res) => {
  try {
    console.log('Delete file request:', req.params.fileId, 'in class:', req.params.classId);
    console.log('Folder path:', req.body.folderPath);
    
    const user = await User.findById(req.user.id);
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

    console.log('Found file to delete:', file.name);
    
    // Delete physical file if it exists
    if (file.filePath && fs.existsSync(file.filePath)) {
      fs.unlinkSync(file.filePath);
      console.log('Physical file deleted:', file.filePath);
    }
    
    // Remove the file from the array
    if (folderPath.length === 0) {
      classObj.files = classObj.files.filter(file => file._id.toString() !== req.params.fileId);
    } else {
      const folder = findFolderByPath(classObj.folders, folderPath);
      if (folder) {
        folder.files = folder.files.filter(file => file._id.toString() !== req.params.fileId);
      }
    }
    await user.save();
    
    console.log('File deleted successfully');
    res.status(200).json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// Serve uploaded files
const serveFile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
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

    if (!file.filePath || !fs.existsSync(file.filePath)) {
      return res.status(404).json({ message: 'File not found on disk' });
    }

    // Set appropriate headers
    res.setHeader('Content-Type', file.mimeType || 'application/octet-stream');
    res.setHeader('Content-Disposition', `inline; filename="${file.originalName || file.name}"`);
    
    // Stream the file
    const fileStream = fs.createReadStream(file.filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error('Error serving file:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Custom middleware to handle file upload with error handling
const uploadMiddleware = (req, res, next) => {
  console.log('=== UPLOAD MIDDLEWARE CALLED ===');
  console.log('Upload middleware called');
  console.log('Content-Type:', req.get('Content-Type'));
  
  upload.single('file')(req, res, (err) => {
    if (err) {
      console.error('Multer error:', err);
      return res.status(400).json({ message: 'File upload error: ' + err.message });
    }
    
    console.log('Multer processing completed');
    console.log('Processed file:', req.file);
    console.log('Processed body:', req.body);
    console.log('=== UPLOAD MIDDLEWARE COMPLETED ===');
    
    next();
  });
};

module.exports = { getFiles, createFile, updateFile, deleteFile, serveFile, upload, uploadMiddleware };

