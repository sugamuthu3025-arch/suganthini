const jwt = require('jsonwebtoken');

// Simple JWT middleware to protect routes (intended for admin usage)
const protect = (req, res, next) => {
  let token;

  // 1. Check if token is present in the Authorization header (Bearer TOKEN)
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      
      // 2. Verify token
      // In a real app, this token would verify a specific 'admin' user.
      // Here, we just check validity to simulate protection.
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach decoded user info (or just confirmation) to the request
      req.user = decoded.id; // Assuming we stored a user ID in the token
      next(); // Proceed to the route handler
    } catch (error) {
      console.error(error);
      // Token is invalid, expired, or failed verification
      res.status(401).json({ message: 'Not authorized, invalid token' });
    }
  }

  // 3. If no token in header
  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

// IMPORTANT: For testing admin routes, you can generate a token quickly using jwt.sign()
// Example: const testToken = jwt.sign({ id: 'test_admin_id' }, 'YOUR_VERY_STRONG_SECRET_KEY', { expiresIn: '1h' });

module.exports = protect;
