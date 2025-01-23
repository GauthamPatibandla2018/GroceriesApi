const jwt = require('jsonwebtoken');

// Secret key to sign the JWT
const secretKey = "ABDEVEILLIERS";

// Middleware to verify JWT token
const tokenValidation = (req, res, next) => {
  // Get the token from the Authorization header  which is like 'Bearer <token>'
  const token = req.headers['authorization']?.split(' ')[1]; 

  // send Unauthorized (401) for no token
  if (!token) {
    return res.status(401).json({ message: 'No token provided, authorization denied.' });
  }

  // Verify the token
  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Token is invalid or expired.' });
    }

    // If the token is valid, store the decoded payload in the request object
    req.user = decoded;
    // Proceed to the actual api route by invoking next
    next(); 
  });
};

module.exports = tokenValidation;
