const multer = require("multer");

const storage = multer.diskStorage({
  destination: "./public/proofFiles",
  filename: (req, file, cb) => {
    const Prooffile = file.originalname;
    cb(null, Prooffile);
    req.session.Prooffile = Prooffile;
  },
});

const upload = multer({ storage });

module.exports = upload;
