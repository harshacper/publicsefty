/**
 * Restricts route access to specified user roles (e.g. 'admin', 'police_officer')
 * @param  {...string} roles Allowed roles
 */
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access restricted to authorized personnel with [${roles.join(', ')}] privileges.`,
      });
    }
    next();
  };
};
