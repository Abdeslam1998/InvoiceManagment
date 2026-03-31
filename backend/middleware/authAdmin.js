const jwt = require("jsonwebtoken");

const authAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "Access denied. Token missing." });

  const token = authHeader.split(" ")[1]; // si "Bearer <token>"
  if (!token) return res.status(401).json({ message: "Token missing" });

  try {
    // ✅ Vérification du token ici
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = verified; 
    req.adminId = verified.adminId;
    next(); 
  } catch (error) {
    res.status(400).json({ message: "Invalid token" });
  }
};

module.exports = authAdmin;