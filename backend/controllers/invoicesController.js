const Invoice = require("../models/invoice");
const Client = require("../models/client");
const Product = require("../models/product");
const mongoose = require("mongoose");

// GET all invoices
const getInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find()
      .populate("clientId", "name email phone") // Info client
      .populate("products.productId", "name price"); // Info produit
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET invoice by ID
const getInvoiceById = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id))
      return res.status(400).json({ message: "Invalid invoice ID" });

    const invoice = await Invoice.findById(req.params.id)
      .populate("clientId", "name email phone")
      .populate("products.productId", "name price");

    if (!invoice) return res.status(404).json({ message: "Invoice not found" });

    res.json(invoice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const Counter = require("../models/counter");

const createInvoice = async (req, res) => {
  try {
    const { clientId, products, date } = req.body;

    const client = await Client.findById(clientId);
    if (!client) return res.status(404).json({ message: "Client not found" });

    // Vérifier les doublons dans le tableau products
    const productIds = products.map(p => p.productId.toString());
    const uniqueProductIds = new Set(productIds);
    if (uniqueProductIds.size !== productIds.length) {
      return res.status(400).json({ message: "Chaque produit ne peut apparaître qu'une seule fois dans la facture." });
    }

    // incrémenter compteur facture
    const counter = await Counter.findOneAndUpdate(
        { name: "invoice" },
        { $inc: { value: 1 } },
        { returnDocument: "after", upsert: true }
    );  

    // numéro facture formaté 0001
    const invoiceNumber = String(counter.value).padStart(4, "0");

    let totalInvoice = 0;

    const invoiceProducts = await Promise.all(
      products.map(async (item) => {
        const product = await Product.findById(item.productId);

        if (!product) throw new Error("Product not found");

        const price = product.price;
        const productTotal = price * item.quantity;

        totalInvoice += productTotal;

        return {
          productId: item.productId,
          quantity: item.quantity,
          price,
          total: productTotal
        };
      })
    );

    const invoice = new Invoice({
        invoiceNumber,
        clientId,
        products: invoiceProducts,
        total: totalInvoice,
        remaining: totalInvoice, 
        status: "unpaid",         
        date: date ? date : new Date()
    });

    await invoice.save();

    res.status(201).json(invoice);

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// UPDATE invoice
const updateInvoice = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id))
      return res.status(400).json({ message: "Invalid invoice ID" });

    const invoice = await Invoice.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });

    res.json(invoice);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateInvoicePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { paidAmount } = req.body; // montant payé maintenant

    const invoice = await Invoice.findById(id);
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });

    // calcul du reste
    invoice.remaining -= paidAmount;

    // mettre à jour le status
    if (invoice.remaining <= 0) {
      invoice.status = "paid";
      invoice.remaining = 0;
    } else if (invoice.remaining < invoice.total) {
      invoice.status = "partial";
    } else {
      invoice.status = "unpaid";
    }

    await invoice.save();
    res.json(invoice);

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// DELETE invoice
const deleteInvoice = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id))
      return res.status(400).json({ message: "Invalid invoice ID" });

    const invoice = await Invoice.findByIdAndDelete(req.params.id);
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });

    res.json({ message: "Invoice deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  updateInvoicePayment
};