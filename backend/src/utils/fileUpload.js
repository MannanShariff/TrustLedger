const path = require('path');
const multer = require('multer');
const { generateDocumentHash } = require('./hashUtils');

// Set storage engine
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: function(req, file, cb) {
    // Create unique filename with original extension
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
    );
  }
});

// Check file type
const fileFilter = (req, file, cb) => {
  // Allowed extensions
  const filetypes = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx/;
  // Check extension
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime type
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Error: Invalid file type!'));
  }
};

// Initialize upload
const upload = multer({
  storage: storage,
  limits: { fileSize: process.env.MAX_FILE_SIZE || 5000000 }, // 5MB default
  fileFilter: fileFilter
});

// Middleware to handle file upload and hash generation
const handleFileUpload = (fieldName) => async (req, res, next) => {
  try {
    // Use multer upload
    const uploadMiddleware = upload.single(fieldName);
    
    uploadMiddleware(req, res, async (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }

      // If no file was uploaded, continue
      if (!req.file) {
        return next();
      }

      try {
        // Generate hash for the uploaded file
        const fileBuffer = req.file.buffer || await fs.promises.readFile(req.file.path);
        const documentHash = generateDocumentHash(fileBuffer);

        // Add file info and hash to request
        req.fileInfo = {
          filename: req.file.filename,
          path: req.file.path,
          mimetype: req.file.mimetype,
          size: req.file.size,
          documentHash
        };

        next();
      } catch (error) {
        return res.status(500).json({
          success: false,
          message: 'Error processing file',
          error: error.message
        });
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error uploading file',
      error: error.message
    });
  }
};

// Transaction file upload middleware
const uploadTransactionFiles = handleFileUpload('invoice');

module.exports = {
  upload,
  handleFileUpload,
  uploadTransactionFiles
};