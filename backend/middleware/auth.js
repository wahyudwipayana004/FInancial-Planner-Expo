const jwt = require("jsonwebtoken");
const JWT_SECRET = "supersecretkey";

module.exports = function (req, res, next) {
  const header = req.headers.authorization;

  if (!header) {
    return res.status(401).json({ message: "No token" });
  }

  const token = header.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // {id, email}
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};
