const jwt = require('jsonwebtoken'); //library used to check if user is authenticated or fake 
const User = require('../models/userModel');

const protect = async (req, res, next) => { //next passes control to next middleware LEARN MORE
  let token;

  //if ticket starts with Bearer, it means the user is authenticated
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1]; //extract ticket and ignore bearer 
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select('-password');

      if (req.user) {
        next();
      } else {
        res.status(401).json({ message: 'User not found' });
      }

    } catch (err) {
      console.error(err);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};



module.exports = { protect };