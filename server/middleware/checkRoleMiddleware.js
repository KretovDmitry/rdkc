const jwt = require("jsonwebtoken");

module.exports = function (role) {
  return function (req, res, next) {
    if (req.method === "OPTIONS") {
      next();
    }
    try {
      const token = req.headers.authorization.split(" ")[1];
      if (!token) {
        res.status(403).json({ message: "You have no access" });
      }
      req.user = jwt.verify(token, process.env.SECRET_KEY);
      if (req.user.role !== role) {
        res.status(403).json({ message: "You have no access" });
      }
      next();
    } catch (e) {
      res.status(403).json({ message: "You have no access" });
    }
  };
};
