const express = require("express");
const router = express.Router();
const { loginAdmin, getProfile, updateProfile } = require("../controllers/adminController");
const authAdmin = require("../middleware/authAdmin");

// Route login
router.post("/login", loginAdmin);

// Profile routes
router.get("/profile", authAdmin, getProfile);
router.put("/profile", authAdmin, updateProfile);

module.exports = router;