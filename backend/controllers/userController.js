const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/userModel');

// Helper function to generate a JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d', // The token will expire after 30 days
  });
};

const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Please enter all fields' });
    }

    const userExists = await User.findOne({ $or: [{ username }, { email }] });
    if (userExists) {
      return res.status(409).json({ message: 'User already exists with this username or email' });
    }

    const newUser = new User({
      username,
      email,
      password,
    });

    const savedUser = await newUser.save();

    res.status(201).json({
      _id: savedUser._id,
      username: savedUser.username,
      email: savedUser.email,
      token: generateToken(savedUser._id), // Generate token after successful registration
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};



const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    // passwords don't match
    if (isMatch) {
        res.status(200).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        token: generateToken(user._id), // This is the new line that generates the token
    });
    } 
    else {
    return res.status(400).json({ message: 'Invalid credentials' })
    }
} 
    
    // unexpected error
catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
    }
};



const getClasses = async (req, res) => {
  try {
    // The 'protect' middleware adds the user object to the request.
    // We can use req.user to find the user's classes.
    const user = await User.findById(req.user.id).select('classes');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    // Return just the classes array
    res.status(200).json(user.classes);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ----------------------------------------------------------------------
// @desc    Create a new class for a user
// @route   POST /api/classes
// @access  Private
// ----------------------------------------------------------------------
const createClass = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Please provide a class name' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Create a new class object with an empty folders array
    const newClass = {
      name: name,
      folders: [],
    };

    // Push the new class into the user's classes array
    user.classes.push(newClass);
    // Save the entire user document
    await user.save();

    // Return the newly created class object
    // We get the last item in the array, which is the one we just added
    res.status(201).json(user.classes[user.classes.length - 1]);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ----------------------------------------------------------------------
// @desc    Update a specific class
// @route   PUT /api/classes/:classId
// @access  Private
// ----------------------------------------------------------------------
const updateClass = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find the specific class by its ID within the user's classes array
    const classToUpdate = user.classes.id(req.params.classId);
    if (!classToUpdate) {
      return res.status(404).json({ message: 'Class not found' });
    }

    // Update the class's name from the request body
    classToUpdate.name = req.body.name || classToUpdate.name;

    // Save the updated user document
    await user.save();

    res.status(200).json(classToUpdate);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};




const deleteClass = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find the specific class to be removed
    const classToDelete = user.classes.id(req.params.classId);
    if (!classToDelete) {
      return res.status(404).json({ message: 'Class not found' });
    }

    // Use the Mongoose array method to remove the class
    classToDelete.deleteOne();

    // Save the user document after removal
    await user.save();

    res.status(200).json({ message: 'Class removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Export all the controller functions
module.exports = {
    registerUser,
    loginUser,
    getClasses,
    createClass,
    updateClass,
    deleteClass,
};