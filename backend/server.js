require('dotenv').config();

// Import necessary packages
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

app.use(cors())
app.use(express.json()); // To parse JSON bodies
app.use(express.urlencoded({ extended: true })); // To parse URL-encoded bodies

const userRoutes = require('./routes/userRoutes');
const classRoutes = require('./routes/classRoutes');
const fileRoutes = require('./routes/filesRoutes');
const feynmanRoutes = require('./routes/feynmanRoutes');
const flashcardRoutes = require('./routes/flashcardRoutes');

app.use('/api/users', userRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/classes', fileRoutes);
app.use('/api/feynman', feynmanRoutes);
app.use('/api/classes', flashcardRoutes);

// Define the port the server will run on
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    // If connection is successful, log a success message
    console.log('Connected to MongoDB successfully!');
    
    // Once connected, start the server
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch(err => {
    // If connection fails, log the error
    console.error('Failed to connect to MongoDB:', err);
  });

// Basic route to test if the server is running
app.get('/', (req, res) => {
  res.send('Hello from the StudyBuddy backend!');
});
