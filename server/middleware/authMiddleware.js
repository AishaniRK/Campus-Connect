const { verifyToken } = require('../config/jwt');
const db = require('../config/db');

async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No authentication token provided.'
      });
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token. Please log in again.'
      });
    }

    // Verify user exists and is active
    const [rows] = await db.query('SELECT id, name, email, role, status FROM users WHERE id = ?', [decoded.id]);
    const user = rows[0];

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User account no longer exists.'
      });
    }

    if (user.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: `Account is ${user.status}. Please contact the administrator.`
      });
    }

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    next();
  } catch (error) {
    console.error('[AuthMiddleware Error]', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during authentication.'
    });
  }
}

module.exports = {
  authenticate
};

