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
    const paidAmount = req.body.paidAmount || 0;
    const status = req.body.status || 'unpaid';

    const invoiceProducts = [];

    for (const item of products) {
      const product = await Product.findById(item.productId);
      if (!product) return res.status(404).json({ message: `Produit introuvable : ${item.productId}` });

      if (product.stock <= 0) {
        return res.status(400).json({ message: `Le produit ${product.name} est épuisé.` });
      }

      if (item.quantity > product.stock) {
        return res.status(400).json({
          message: `Quantité insuffisante pour ${product.name}. Disponible : ${product.stock}.`
        });
      }

      const price = product.price;
      const productTotal = price * item.quantity;
      totalInvoice += productTotal;

      invoiceProducts.push({
        productId: item.productId,
        quantity: item.quantity,
        price,
        total: productTotal
      });
    }

    let remaining = totalInvoice;
    if (status === 'paid') {
      remaining = 0;
    } else if (status === 'partial') {
      if (paidAmount <= 0 || paidAmount >= totalInvoice) {
        return res.status(400).json({ message: 'Le montant payé partiel doit être supérieur à 0 et inférieur au total de la facture.' });
      }
      remaining = totalInvoice - paidAmount;
    }

    const invoice = new Invoice({
        invoiceNumber,
        clientId,
        products: invoiceProducts,
        total: totalInvoice,
        remaining,
        status,
        date: date ? date : new Date()
    });

    await invoice.save();

    await Promise.all(products.map(item =>
      Product.findByIdAndUpdate(item.productId, { $inc: { stock: -item.quantity } })
    ));

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