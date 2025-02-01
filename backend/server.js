import express from 'express';
import multer from 'multer';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import session from 'express-session';

const app = express();

// Enable CORS and JSON body parsing
app.use(cors());
app.use(express.json());

// Setup session for tracking payslip numbers
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));


const uploadDir = './uploads';
const pdfDir = './uploads/pdf';
const wordDir = './uploads/word';


[uploadDir, pdfDir, wordDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, pdfDir); 
    } else if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      cb(null, wordDir); 
    } else {
      cb(new Error('Invalid file type'), false);
    }
  },
  filename: (req, file, cb) => {
    // Retain the original file name
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });


const getCurrentPayslipNumber = () => {
  const counterFile = './counter.txt';
  if (fs.existsSync(counterFile)) {
    const data = fs.readFileSync(counterFile, 'utf8');
    const payslipNumber = parseInt(data, 10);
    return isNaN(payslipNumber) ? 1 : payslipNumber;
  }
  return 1;
};

const incrementPayslipNumber = () => {
  const counterFile = './counter.txt';
  let payslipNumber = getCurrentPayslipNumber();
  payslipNumber += 1;
  fs.writeFileSync(counterFile, payslipNumber.toString(), 'utf8');
  return payslipNumber;
};


app.get('/next-payslip-number', (req, res) => {
  if (!req.session.payslipNumber) {
    req.session.payslipNumber = getCurrentPayslipNumber();
  }
  res.json({ payslipNumber: req.session.payslipNumber });
});


app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  if (!req.session.payslipNumber) {
    req.session.payslipNumber = incrementPayslipNumber();
  }

  const filePath = `/uploads/${req.file.mimetype === 'application/pdf' ? 'pdf' : 'word'}/${req.file.originalname}`;

  res.json({
    message: 'File uploaded successfully',
    filePath,
    payslipNumber: req.session.payslipNumber,
  });
});


app.get('/listFiles', (req, res) => {
  const pdfFiles = fs.readdirSync(pdfDir).map(file => ({
    name: file,
    path: `/uploads/pdf/${file}`,
  }));
  const wordFiles = fs.readdirSync(wordDir).map(file => ({
    name: file,
    path: `/uploads/word/${file}`,
  }));

  res.json({ pdfFiles, wordFiles });
});


app.get('/viewPayslip', (req, res) => {
  const { payslipNumber, type } = req.query;
  const dir = type === 'pdf' ? pdfDir : wordDir;

  const file = fs.readdirSync(dir).find(file => file.includes(payslipNumber));

  if (file) {
    const filePath = path.join(dir, file);
    res.json({ filePath: filePath.replace('./uploads', '') });
  } else {
    res.status(404).json({ error: `${type.toUpperCase()} Payslip not found.` });
  }
});


app.use('/uploads', express.static(uploadDir));


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
