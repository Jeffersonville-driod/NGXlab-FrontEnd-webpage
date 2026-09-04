const fs = require('fs');
const path = require('path');

// Define directory structure to create
const dirs = [
  'api',
  'api/config',
  'api/models',
  'api/routes',
  'api/controllers',
  'api/middleware'
];

// Define starter files with default contents
const files = {
  // .env
  '.env': `PORT=5000\nMONGODB_URI=mongodb://localhost:27017/tradia_ecommerce\nJWT_SECRET=super_secret_jwt_key_123\n`,

  // api/config/db.js
  'api/config/db.js': `const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tradia_ecommerce');
    console.log(\`MongoDB Connected: \${conn.connection.host}\`);
  } catch (error) {
    console.error(\`Error: \${error.message}\`);
    process.exit(1);
  }
};

module.exports = connectDB;
`,

  // api/models/Product.js
  'api/models/Product.js': `const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  category: { type: String, required: true },
  stock: { type: Number, required: true, default: 0 },
  imageUrl: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
`,

  // api/models/User.js
  'api/models/User.js': `const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['customer', 'admin'], default: 'customer' }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
`,

  // api/models/Order.js
  'api/models/Order.js': `const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  orderItems: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true }
    }
  ],
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ['Pending', 'Paid', 'Shipped'], default: 'Pending' }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
`,

  // api/routes/productRoutes.js
  'api/routes/productRoutes.js': `const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// GET all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST new product
router.post('/', async (req, res) => {
  try {
    const newProduct = new Product(req.body);
    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
`,

  // api/server.js
  'api/server.js': `const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const connectDB = require('./config/db');

const app = express();

// Connect Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/products', require('./routes/productRoutes'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', store: 'Tradia E-Commerce API Active' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(\`E-Commerce server running on port \${PORT}\`));
`
};

// Execution logic
console.log('Generating E-Commerce Backend Folder Layout...\n');

// 1. Create Directories
dirs.forEach((dir) => {
  const dirPath = path.join(__dirname, dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created Directory: ${dir}`);
  }
});

// 2. Create Files
Object.entries(files).forEach(([filePath, content]) => {
  const absolutePath = path.join(__dirname, filePath);
  if (!fs.existsSync(absolutePath)) {
    fs.writeFileSync(absolutePath, content, 'utf8');
    console.log(`Created File: ${filePath}`);
  } else {
    console.log(`Skipped existing file: ${filePath}`);
  }
});

// 3. Update package.json scripts automatically
const pkgPath = path.join(__dirname, 'package.json');
if (fs.existsSync(pkgPath)) {
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  pkg.scripts = pkg.scripts || {};
  pkg.scripts.start = "node api/server.js";
  pkg.scripts.dev = "nodemon api/server.js";
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2), 'utf8');
  console.log('Updated package.json start scripts!');
}

console.log('\nSetup Complete! Run "npm start" to launch your server.');
