const bcrypt = require("bcryptjs");
const Admin = require("../models/Admin");
const jwt = require("jsonwebtoken");

// créer un admin par défaut si aucun n’existe
const initDefaultAdmin = async () => {
  try {
    const existing = await Admin.findOne({ email: "admin@fromagim.com" });
    if (existing) return;

    const hashedPassword = await bcrypt.hash("Azerty@1998", 10);

    const admin = new Admin({
      email: "admin@fromagim.com",
      password: hashedPassword
    });

    await admin.save();
    console.log("✅ Admin par défaut créé : admin@test.com");
  } catch (error) {
    console.error("Erreur lors de la création de l'admin par défaut", error);
  }
};

// login admin
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid password" });

    // ✅ Génération du token JWT ici
    const token = jwt.sign(
      { adminId: admin._id, email: admin.email },
      process.env.JWT_SECRET, // clé secrète depuis .env
      { expiresIn: "7d" }
    );

    res.json({ message: "Login success", token });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get profile
const getProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.adminId).select("-password");
    if (!admin) return res.status(404).json({ message: "Admin not found" });
    res.json(admin);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update profile
const updateProfile = async (req, res) => {
  try {
    const { responsibleName, companyName, address, phone, email, oldPassword, newPassword } = req.body;
    const admin = await Admin.findById(req.adminId);
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    if (oldPassword || newPassword) {
      if (!oldPassword || !newPassword) {
        return res.status(400).json({ message: "Veuillez fournir l'ancien et le nouveau mot de passe." });
      }

      const isMatch = await bcrypt.compare(oldPassword, admin.password);
      if (!isMatch) {
        return res.status(400).json({ message: "L'ancien mot de passe est incorrect." });
      }

      if (newPassword.length < 8 || !/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
        return res.status(400).json({ message: "Le nouveau mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre." });
      }

      admin.password = await bcrypt.hash(newPassword, 10);
    }

    if (responsibleName !== undefined) admin.responsibleName = responsibleName;
    if (companyName !== undefined) admin.companyName = companyName;
    if (address !== undefined) admin.address = address;
    if (phone !== undefined) admin.phone = phone;
    if (email !== undefined) admin.email = email;

    await admin.save();

    const adminResponse = admin.toObject();
    delete adminResponse.password;

    res.json({ message: "Profile updated successfully", admin: adminResponse });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { initDefaultAdmin, loginAdmin, getProfile, updateProfile };