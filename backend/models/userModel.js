const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // A security library for hashing passwords

const fileSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, default: 'file' },
  content: { type: String, default: '' },
  originalName: { type: String }, // Original filename from upload
  filePath: { type: String }, // Path to stored file
  fileSize: { type: Number }, // File size in bytes
  mimeType: { type: String }, // MIME type of the file
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const flashcardSchema = new mongoose.Schema({
  front: { type: String, required: true },
  back: { type: String, required: true },
  frontImage: { type: String }, // URL to stored image
  backImage: { type: String }, // URL to stored image
  frontMath: { type: String }, // LaTeX math equation
  backMath: { type: String }, // LaTeX math equation
  createdAt: { type: Date, default: Date.now }
});

const flashcardSetSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  cards: [flashcardSchema],
  activeRecallData: [{
    cardId: { type: mongoose.Schema.Types.ObjectId, ref: 'flashcard' },
    knowledgeLevel: { type: Number, default: 0 }, // 0-5 scale
    lastReviewed: { type: Date, default: Date.now },
    reviewCount: { type: Number, default: 0 }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const folderSchema = new mongoose.Schema({
  name: { type: String, required: true },
  files: [fileSchema],
  flashcardSets: [flashcardSetSchema],
  folders: [] // placeholder
});
folderSchema.add({ folders: [folderSchema] }); // recursion

const classSchema = new mongoose.Schema({
  name: { type: String, required: true },
  files: [fileSchema],
  flashcardSets: [flashcardSetSchema],
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