const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json("Access denied. No token provided.");
  }

  const token = authHeader.split(" ")[1];

try {
  const verified = jwt.verify(token, process.env.JWT_SECRET);
  req.user = verified;
  next();
} catch (err) {
  return res.status(401).json("Token expired or invalid");
}
};

module.exports = verifyToken;