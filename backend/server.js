require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const adminRoutes = require("./routes/admin");
const clientRoutes = require("./routes/client");
const productRoutes = require("./routes/product");
const invoiceRoutes = require("./routes/invoice");
const { initDefaultAdmin } = require("./controllers/adminController");

const app = express();

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:4200',
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());

// Connexion MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    // Initialize default admin after DB connection
    const { initDefaultAdmin } = require("./controllers/adminController");
    initDefaultAdmin();
  })
  .catch(err => console.error(err));

// Routes
app.use("/api/admin", adminRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/products", productRoutes);
app.use("/api/invoices", invoiceRoutes);

// Démarrage serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));