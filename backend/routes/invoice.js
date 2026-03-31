const express = require("express");
const router = express.Router();
const invoiceController = require("../controllers/invoicesController");
const mongoose = require("mongoose");

const authAdmin = require("../middleware/authAdmin");


// Middleware ID
const validateId = (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id))
    return res.status(400).json({ message: "Invalid ID" });
  next();
};

router.get("/",authAdmin, invoiceController.getInvoices);
router.get("/:id",authAdmin, validateId, invoiceController.getInvoiceById);
router.post("/",authAdmin, invoiceController.createInvoice);
router.put("/:id",authAdmin, validateId, invoiceController.updateInvoice);
router.delete("/:id",authAdmin, validateId, invoiceController.deleteInvoice);
router.patch("/:id/payment", authAdmin, invoiceController.updateInvoicePayment);


module.exports = router;