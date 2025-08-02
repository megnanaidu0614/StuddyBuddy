const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // A security library for hashing passwords

const fileSchema = new mongoose.Schema({
  name: { type: String, required: true },
  // ...other file fields
});

const flashcardSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true },
  // ...other flashcard fields
});

const folderSchema = new mongoose.Schema({
  name: { type: String, required: true },
  files: [fileSchema],
  flashcards: [flashcardSchema],
  folders: [] // placeholder
});
folderSchema.add({ folders: [folderSchema] }); // recursion

const classSchema = new mongoose.Schema({
  name: { type: String, required: true },
  files: [fileSchema],
  flashcards: [flashcardSchema],
  folders: [folderSchema]
});

const userSchema = new mongoose.Schema({
  // username field
  username: {
    type: String,         
    required: [true, 'Please provide a username'],
    unique: true, //no two users have the same username
    trim: true  // Removes leading whitespace
  },
  
  //email field
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    trim: true,
    match: [
      /^\S+@\S+\.\S+$/, 
      'Please provide a valid email address'
    ]
  },

  //password field
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6 
  },

  classes: [classSchema]
}, {

  // Mongoose will automatically add `createdAt` and `updatedAt` timestamps
  timestamps: true
});

// ----------------------------------------------------------------------
// Mongoose Middleware (Hooks)
// This is a crucial step for security! We hash the password before saving.
// ----------------------------------------------------------------------
userSchema.pre('save', async function (next) {
  // Only run this function if the password was actually modified
  if (!this.isModified('password')) {
    return next();
  }

  // Generate a salt (a random string)
  const salt = await bcrypt.genSalt(10);
  
  // Hash the password with the salt
  this.password = await bcrypt.hash(this.password, salt);
  
  next();
});

// ----------------------------------------------------------------------
// Define the Mongoose Model
// Mongoose automatically creates a collection named "users" from this model.
// ----------------------------------------------------------------------
const User = mongoose.model('User', userSchema);

// Export the model so it can be used in other parts of your application
module.exports = User;