import multer from "multer";
import path from "path";
import { env } from "../config/env.js";

// location
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, env.UPLOAD_DIR);
    },
    filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, unique + path.extname(file.originalname));
    }
});

//filters


const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'application/pdf'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(null, false); 
  }
};


export const upload = multer({
    storage,
    limits: {
        fileSize: env.MAX_FILE_SIZE_MB * 1024 * 1024 
    },fileFilter
});
