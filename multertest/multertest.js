const express = require('express');
const multer = require('multer');
const { s3Uploadv2 } = require('./s3Service');
require("dotenv").config();

const app = express();


// // custom file names
// // format file's (field name)-(original file name) maybe change to user_id?
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "uploads");
//   },
//   filename: (req, file, cb) => {
//     const { originalname, fieldname } = file;
//     cb(null, `${fieldname}-${originalname}`)
//   },
// });

const storage = multer.memoryStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    const { originalname, fieldname } = file;
    cb(null, `${fieldname}-${originalname}`)
  },
});

// filters file type by images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.split("/")[0] === 'image') {
    cb(null, true)
  } else {
    cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE"), false);
  }
};

// limits at 5mb per image
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5000000 }
});

// multiple images by fields posts
const multiUpload = upload.fields([
  { name: "profile" },
  { name: "progress" },
]);

app.post("/upload", multiUpload, async (req, res) => {
  console.log(req.files);
  const result = await s3Uploadv2(req.files)
  res.json({ status: "success", result })
});

app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        message: "File size is too large"
      });
    }

    if (error.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({
        message: "FIle must be an image!"
      });
    }
  }
});

app.listen(3000, () => console.log("listening to port 3000"));