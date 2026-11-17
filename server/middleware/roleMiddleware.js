/**
 * Role-Based Access Control (RBAC) Middleware
 * Restricts route access to specified user roles.
 * 
 * @param {Array<string>|string} allowedRoles - 'student', 'staff', 'admin'
 */
function authorize(allowedRoles = []) {
  if (typeof allowedRoles === 'string') {
    allowedRoles = [allowedRoles];
  }

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: This resource requires one of the following roles: [${allowedRoles.join(', ')}]. Your role is '${req.user.role}'.`
      });
    }

    next();
  };
}

module.exports = {
  authorize
};

