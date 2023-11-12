const jwt = require("jsonwebtoken");

module.exports = function (role) {
  return function (req, res, next) {
    if (req.method === "OPTIONS") {
      next();
    }
    try {
      const token = req.headers.authorization.split(" ")[1];
      if (!token) {
        return res.status(403).json({ message: "У вас нет прав доступа" });
      }
      req.user = jwt.verify(token, process.env.SECRET_KEY);
      if (req.user.role !== role) {
        res.status(403).json({ message: "У вас нет прав доступа" });
      }
      next();
    } catch (e) {
      res.status(403).json({ message: "У вас нет прав доступа" });
    }
  };
};
