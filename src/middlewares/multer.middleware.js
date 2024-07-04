import multer from "multer";

const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/temp/uploads");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

export const upload = multer({ storage: diskStorage });
