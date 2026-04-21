require("dotenv").config();
const mongoose = require("mongoose");
const Client = require("./models/client");
const Product = require("./models/product");
const Invoice = require("./models/invoice");
const Counter = require("./models/counter");

const clients = [
  { name: "Boulangerie El Baraka", phone: "0550123456", address: "12 Rue Didouche Mourad, Alger", email: "contact@elbaraka.dz" },
  { name: "Superette Amine", phone: "0661234567", address: "45 Boulevard Amirouche, Béjaïa", email: "amine.superette@gmail.com" },
  { name: "Restaurant Le Palmier", phone: "0770345678", address: "8 Avenue de l'ALN, Oran", email: "lepalmier.resto@gmail.com" },
  { name: "Café Nédjma", phone: "0552456789", address: "23 Rue Larbi Ben M'hidi, Constantine", email: "nedjma.cafe@outlook.com" },
  { name: "Pâtisserie Royale", phone: "0663567890", address: "101 Rue Hassiba Ben Bouali, Blida", email: "patisserie.royale@gmail.com" },
  { name: "Hôtel Essafir", phone: "0774678901", address: "5 Place des Martyrs, Sétif", email: "essafir.hotel@gmail.com" },
  { name: "Épicerie Mounir", phone: "0555789012", address: "32 Cité 1000 Logements, Batna", email: "mounir.epicerie@gmail.com" },
  { name: "Laiterie Tassili", phone: "0666890123", address: "Zone Industrielle, Tizi Ouzou", email: "tassili.lait@gmail.com" },
];

const products = [
  { name: "Lait Pasteurisé 1L", price: 50, stock: 500 },
  { name: "Lait Demi-Écrémé 1L", price: 60, stock: 350 },
  { name: "Lben 1L", price: 45, stock: 400 },
  { name: "Yaourt Nature (pack 6)", price: 180, stock: 200 },
  { name: "Yaourt Fruité (pack 6)", price: 220, stock: 180 },
  { name: "Fromage Frais 250g", price: 150, stock: 120 },
  { name: "Beurre 200g", price: 250, stock: 90 },
  { name: "Crème Fraîche 20cl", price: 130, stock: 160 },
  { name: "Raïb 1L", price: 55, stock: 300 },
  { name: "Lait en Poudre 500g", price: 480, stock: 75 },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");

    // Clear existing data (except admins)
    await Client.deleteMany({});
    await Product.deleteMany({});
    await Invoice.deleteMany({});
    await Counter.deleteMany({});
    console.log("Cleared existing data");

    const savedClients = await Client.insertMany(clients);
    console.log(`Inserted ${savedClients.length} clients`);

    const savedProducts = await Product.insertMany(products);
    console.log(`Inserted ${savedProducts.length} products`);

    // Create invoices with realistic data
    const invoices = [];
    let invoiceNum = 1;

    const daysAgo = (n) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);

    const invoiceDefs = [
      { clientIdx: 0, items: [[0, 50], [2, 30]], status: "paid", remaining: 0, daysBack: 25 },
      { clientIdx: 1, items: [[0, 100], [3, 20], [4, 15]], status: "paid", remaining: 0, daysBack: 22 },
      { clientIdx: 2, items: [[5, 10], [7, 20], [8, 15]], status: "partial", remainingPct: 0.4, daysBack: 18 },
      { clientIdx: 3, items: [[0, 30], [2, 20], [8, 25]], status: "paid", remaining: 0, daysBack: 15 },
      { clientIdx: 4, items: [[5, 25], [6, 15], [7, 30]], status: "unpaid", remainingPct: 1, daysBack: 12 },
      { clientIdx: 5, items: [[0, 200], [1, 100], [3, 40], [9, 20]], status: "partial", remainingPct: 0.3, daysBack: 10 },
      { clientIdx: 6, items: [[0, 60], [2, 40], [9, 10]], status: "paid", remaining: 0, daysBack: 8 },
      { clientIdx: 7, items: [[0, 300], [1, 200], [2, 150]], status: "partial", remainingPct: 0.5, daysBack: 6 },
      { clientIdx: 0, items: [[3, 30], [4, 25]], status: "unpaid", remainingPct: 1, daysBack: 5 },
      { clientIdx: 1, items: [[6, 20], [9, 15]], status: "paid", remaining: 0, daysBack: 4 },
      { clientIdx: 2, items: [[0, 80], [1, 60]], status: "unpaid", remainingPct: 1, daysBack: 3 },
      { clientIdx: 3, items: [[3, 15], [4, 10], [5, 8]], status: "partial", remainingPct: 0.6, daysBack: 2 },
      { clientIdx: 5, items: [[0, 150], [2, 100], [7, 50]], status: "unpaid", remainingPct: 1, daysBack: 1 },
      { clientIdx: 4, items: [[0, 40], [8, 30]], status: "paid", remaining: 0, daysBack: 0 },
      { clientIdx: 7, items: [[9, 25], [6, 10]], status: "unpaid", remainingPct: 1, daysBack: 0 },
    ];

    for (const def of invoiceDefs) {
      const client = savedClients[def.clientIdx];
      const invoiceProducts = def.items.map(([pIdx, qty]) => {
        const p = savedProducts[pIdx];
        return {
          productId: p._id,
          quantity: qty,
          price: p.price,
          total: p.price * qty,
        };
      });

      const total = invoiceProducts.reduce((sum, p) => sum + p.total, 0);
      const remaining = def.remaining === 0 ? 0 : Math.round(total * def.remainingPct);

      invoices.push({
        invoiceNumber: `FAC-${String(invoiceNum++).padStart(4, "0")}`,
        clientId: client._id,
        products: invoiceProducts,
        total,
        remaining,
        status: def.status,
        date: daysAgo(def.daysBack),
      });
    }

    await Invoice.insertMany(invoices);
    console.log(`Inserted ${invoices.length} invoices`);

    await Counter.create({ name: "invoice", value: invoiceNum - 1 });
    console.log("Invoice counter set");

    // Reduce stock based on invoiced quantities
    for (const inv of invoices) {
      for (const item of inv.products) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: -item.quantity },
        });
      }
    }
    console.log("Product stock adjusted");

    console.log("\nSeed completed successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Seed failed:", err);
    process.exit(1);
  }
}

seed();
