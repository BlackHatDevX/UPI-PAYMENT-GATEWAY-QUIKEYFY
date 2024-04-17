const multer = require("multer");

const storage = multer.diskStorage({
  destination: "./public/projectFiles",
  filename: (req, file, cb) => {
    const Pfile = file.originalname;
    cb(null, Pfile);
    req.session.filename = Pfile;
  },
});

const upload = multer({ storage });

module.exports = upload;
