const express = require("express");
const router = express.Router();
const clientController = require("../controllers/clientController");
const mongoose = require("mongoose");

const authAdmin = require("../middleware/authAdmin");

// Middleware pour vérifier ID
const validateId = (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "Invalid client ID" });
  }
  next();
};

// Routes clients
router.get("/",authAdmin, clientController.getClients);
router.get("/:id",authAdmin, validateId, clientController.getClientById);
router.post("/",authAdmin, clientController.createClient);
router.put("/:id",authAdmin, validateId, clientController.updateClient);
router.delete("/:id",authAdmin, validateId, clientController.deleteClient);

module.exports = router;