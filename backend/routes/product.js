const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const mongoose = require("mongoose");

const authAdmin = require("../middleware/authAdmin");


// Middleware pour vérifier l'ID
const validateId = (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id))
    return res.status(400).json({ message: "Invalid product ID" });
  next();
};

// Routes CRUD produits
router.get("/",authAdmin, productController.getProducts);
router.get("/:id",authAdmin, validateId, productController.getProductById);
router.post("/",authAdmin, productController.createProduct);
router.put("/:id",authAdmin, validateId, productController.updateProduct);
router.delete("/:id",authAdmin, validateId, productController.deleteProduct);

module.exports = router;