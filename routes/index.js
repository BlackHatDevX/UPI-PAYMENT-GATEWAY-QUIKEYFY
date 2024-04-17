var express = require("express");
var router = express.Router();
var usermodel = require("./users");
var uploadfile = require("./multerfiles");
var uploadproof = require("./multerproof");
var QRCode = require("qrcode");
var transactionModel = require("./transaction");
const projectsdb = require("./projectsdb");
const planCost = require("./planCost");
require("dotenv").config();

router.use((req, res, next) => {
  if (req.url == "/login") {
    try {
      if (req.session.authUser.auth == true) {
        res.redirect("/profile");
        next();
      } else {
        next();
      }
    } catch {
      next();
    }
  } else {
    next();
  }
});

router.get("/", (req, res) => {
  res.render("home");
});

/* GET login page. */
router.get("/login", function (req, res, next) {
  const wrongData = req.flash("Error");
  wrongData == false
    ? res.render("login", { showError: false })
    : res.render("login", { showError: true });
});

// GET SIGNUP PAGE
router.get("/signup", function (req, res, next) {
  const wrongData = req.flash("Error");
  wrongData == false
    ? res.render("signup", { showError: false })
    : res.render("signup", { showError: true });
});

//GET PROFILE PAGE
router.get("/profile", async (req, res) => {
  try {
    if (req.session.authUser.authID == "admin") {
      res.redirect("/admin");
    } else if (req.session.authUser.auth == true) {
      const user = req.session.authUser;
      const userID = user.authID;
      //fetch data of user with id
      const userData = await usermodel.find({
        _id: userID,
      });
      res.render("main/user/profile", { user: userData[0] });
    } else {
      res.redirect("/");
    }
  } catch {
    res.redirect("/");
  }
});

// POST PROJECT DATA
router.post("/submitproject", uploadfile.single("file"), async (req, res) => {
  try {
    const type = req.body.type;
    const notes = req.body.notes;
    req.session.PType = type;

    const d = new Date();
    // Create a new Date object
    const currentDate = new Date();
    // Get the current date and time as a string
    const dateString = currentDate.toLocaleDateString("en-IN");
    let time = d.getTime();
    let hour = d.getHours();
    let minutes = d.getMinutes();
    let seconds = d.getSeconds();
    let actualDate = dateString;
    let actualTime = hour + ":" + minutes + ":" + seconds;
    req.session.trId = time;
    const projectData = await projectsdb.create({
      email: req.session.authUser.email,
      trId: req.session.trId,
      charge: 0,
      type: type,
      notes: notes,
      file: "/projectFiles/" + req.session.filename,
      date: actualDate,
      time: actualTime,
    });

    res.redirect("/paynow");
  } catch (error) {
    res.redirect("/profile");
  }
});

// GET PAYNOW
router.get("/paynow", async (req, res) => {
  try {
    if (req.session.authUser.auth) {
      let money = await planCost.find();
      money = money[0].amount;
      let amount = money;
      const user = req.session.authUser;
      const userID = user.authID;
      //fetch data of user with id
      const userData = await usermodel.find({
        _id: userID,
      });
      const d = new Date();
      // Create a new Date object
      const currentDate = new Date();
      // Get the current date and time as a string
      const dateString = currentDate.toLocaleDateString("en-IN");

      let time = d.getTime();
      let hour = d.getHours();
      let minutes = d.getMinutes();
      let seconds = d.getSeconds();
      let actualDate = dateString;
      let actualTime = hour + ":" + minutes + ":" + seconds;
      let PType = req.session.PType;
      const transactionInfo = await transactionModel.create({
        trId: req.session.trId,
        username: userData[0].username,
        email: userData[0].email,
        PType: PType,
        amount: amount,
        time: actualTime,
        date: actualDate,
        userId: req.session.authUser.authID,
        status: "Submit Proof",
      });
      req.session.trData = transactionInfo;
      const moneyApi =
        process.env.upiapi + amount + ".00&cu=INR&aid=uGICAgMDQyfG_dA";
      QRCode.toDataURL(moneyApi, function (err, url) {
        const UserId = req.session.authUser.authID;
        res.render("main/user/payment", {
          userID: UserId,
          QrCode: url,
          PType: PType,
          amount: amount,
          moneyUrl: moneyApi,
          trId: req.session.trId,
        });
      });
    } else {
      res.redirect("/error");
    }
  } catch (error) {
    res.redirect("/error");
  }
});

// GET UPLOAD PROOF
router.get("/uploadproof", (req, res) => {
  try {
    if (req.session.authUser.auth == true) {
      console.log(req.session.trId);
      res.render("main/user/uploadProof", { trId: req.session.trId });
    } else {
      res.redirect("/");
    }
  } catch (error) {
    res.redirect("/profile");
  }
});

// POST PROOF
router.post("/postproof", uploadproof.single("proof"), async (req, res) => {
  try {
    const platform = req.body.platform;
    let trId = req.body.trId;
    if (req.session.trId) {
      trId = req.session.trId;
    }
    console.log(trId);
    const d = new Date();
    // Create a new Date object
    const currentDate = new Date();
    // Get the current date and time as a string
    const dateString = currentDate.toLocaleDateString("en-IN");
    let time = d.getTime();
    let hour = d.getHours();
    let minutes = d.getMinutes();
    let seconds = d.getSeconds();
    let actualDate = dateString;
    let actualTime = hour + ":" + minutes + ":" + seconds;
    let money = await planCost.find();
    money = money[0].amount;
    const filter = { trId: trId };
    const update = {
      platform: platform,
      charge: amount,
      status: "Payment Under Verification ⏳",
      proof: "/proofFiles/" + req.session.Prooffile,
      prooftime: actualTime,
      proofdate: actualDate,
    };
    // `doc` is the document _before_ `update` was applied
    let submittedTransaction = await transactionModel.findOneAndUpdate(
      filter,
      update
    );
    res.redirect("/profile");
  } catch (error) {
    console.log(error);
    res.redirect("/profile");
  }
});

// POST REGISTER
router.post("/register", async (req, res) => {
  const username = req.body.setUsername;
  const email = req.body.setEmail;
  const password = req.body.setPassword;
  const checkEmail = await usermodel.find({ email: email });
  if (checkEmail.length == 0) {
    const checkUsername = await usermodel.find({ username: username });
    if (checkUsername.length == 0) {
      // create user
      const newUser = await usermodel.create({
        username: username,
        email: email,
        password: password,
      });
      req.session.authUser = {
        email: newUser.email,
        authID: newUser._id,
        auth: true,
      };
      res.redirect("/profile");
    } else {
      res.render("errors/usernameError");
    }
  } else {
    res.render("errors/emailError");
  }
});

// POST LOGIN
router.post("/login", async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (email == process.env.admin && password == process.env.pass) {
    req.session.authUser = { authID: "admin", auth: true };
    res.redirect("/admin");
  } else {
    const User = await usermodel.find({
      email: email,
      password: password,
    });
    if (User.length == 0) {
      req.flash("Error", true);
      res.redirect("/login");
    } else {
      req.session.authUser = {
        email: User[0].email,
        authID: User[0]._id,
        auth: true,
      };
      res.redirect("/profile");
    }
  }
});

// GET ADMIN
router.get("/admin", (req, res) => {
  try {
    if (
      req.session.authUser.auth == true &&
      req.session.authUser.authID == "admin"
    ) {
      //fetch data of user with id
      res.render("main/admin/profile");
    } else {
      res.redirect("/");
    }
  } catch {
    res.redirect("/");
  }
});

// GET ORDER FORM
router.get("/order", async (req, res) => {
  try {
    if (req.session.authUser.auth == true) {
      let money = await planCost.find();
      money = money[0].amount;
      res.render("main/user/order", { plan: money });
    } else res.redirect("/");
  } catch (error) {}
});

// GET CANCELPAYMENT
router.get("/cancelPayment", async (req, res) => {
  const trId = req.session.trId;
  const filter = { trId: trId };
  const update = { status: "Payment cancelled by user ✘" };

  // `doc` is the document _before_ `update` was applied
  let failedTransaction = await transactionModel.findOneAndUpdate(
    filter,
    update
  );
  res.redirect("/profile");
});

// POST APPROVE
router.post("/approve", async (req, res) => {
  try {
    req.session.trData.status = "pendingForApproval";
    const img = req.body.paymentProof;
    const trData = req.session.trData;
    console.log(trData);
    console.log(img);
    res.send("Submited for approval");
  } catch (error) {
    res.redirect("/error");
  }
});

// GET TRANSACTIONS
router.get("/track", async (req, res) => {
  try {
    const authID = req.session.authUser.authID;
    const transactions = await transactionModel.find({ userId: authID });
    res.render("main/user/mytransaction", { transactions: transactions });
  } catch (error) {
    res.redirect("/error");
  }
});

// GET ALL APPROVAL
router.get("/manageproject", async (req, res) => {
  try {
    if (
      req.session.authUser.auth == true &&
      req.session.authUser.authID == "admin"
    ) {
      const transactions = await projectsdb.find();
      res.render("main/admin/manageprojects", {
        database: transactions,
      });
    } else {
      res.redirect("/error");
    }
  } catch (error) {
    res.redirect("/error");
  }
});

// GET MANAGE USERS
router.get("/manageaccount", async (req, res) => {
  try {
    if (
      req.session.authUser.auth == true &&
      req.session.authUser.authID == "admin"
    ) {
      // const transactions = await usermodel.find();
      // res.render("main/admin/manageusers", {
      //   users: transactions,
      // });
      res.render("main/admin/manageusers");
    } else {
      console.log(req.session.authUser);
      res.redirect("/error");
    }
  } catch (error) {
    console.log(error);
    res.redirect("/error");
  }
});

// GET PENDING APPROVAL
router.get("/pending", async (req, res) => {
  try {
    if (
      req.session.authUser.auth == true &&
      req.session.authUser.authID == "admin"
    ) {
      const transactions = await transactionModel.find({
        status: "Payment Under Verification ⏳",
      });
      res.render("main/admin/pendingApproval", { transactions: transactions });
    } else {
      res.redirect("/error");
    }
  } catch (error) {
    res.redirect("/error");
  }
});

// GET ALL TRANSACTIONS
router.get("/alltransactions", async (req, res) => {
  try {
    if (
      req.session.authUser.auth == true &&
      req.session.authUser.authID == "admin"
    ) {
      console.log(req.session.authUser);
      const transactions = await transactionModel.find();
      res.render("main/admin/allTransactions", {
        transactionEntries: transactions,
      });
    } else {
      res.redirect("/error");
    }
  } catch (error) {
    res.redirect("/error");
  }
});

// GET VIEW TRANSACTIONS
router.get("/viewTransactions/:username", async (req, res) => {
  try {
    if (
      req.session.authUser.auth == true &&
      req.session.authUser.authID == "admin"
    ) {
      const username = req.params.username;
      const transactions = await transactionModel.find({ username: username });
      res.render("main/user/mytransaction", { transactions: transactions });
    } else {
      res.redirect("/error");
    }
  } catch (error) {
    res.redirect("/error");
  }
});

// POST APPROVAL
router.get("/approve/:trId", async (req, res) => {
  if (
    req.session.authUser.auth == true &&
    req.session.authUser.authID == "admin"
  ) {
    const trId = req.params.trId;
    const filter = { trId: trId };
    const update = { status: "Payment Approved ✔️" };
    let approveTransaction = await transactionModel.findOneAndUpdate(
      filter,
      update
    );
    let money = await planCost.find();
    money = money[0].amount.toString();
    const filterPr = { trId: trId };
    const updatePr = {
      charge: amount,
    };
    // `doc` is the document _before_ `update` was applied
    let submittedPr = await projectsdb.findOneAndUpdate(filterPr, updatePr);
    res.redirect("/pending");
  } else {
    res.redirect("/error");
  }
});

// GET VERIFYPAYMENT
router.get("/verifypayment/:trId", async (req, res) => {
  if (
    req.session.authUser.auth == true &&
    req.session.authUser.authID == "admin"
  ) {
    const trId = req.params.trId;
    const transactionDetail = await transactionModel.find({
      trId: trId,
    });
    res.render("./main/admin/proof", { paymentDetails: transactionDetail[0] });
  } else {
    res.redirect("/error");
  }
});

// POST REJECTION
router.get("/reject/:trId", async (req, res) => {
  if (
    req.session.authUser.auth == true &&
    req.session.authUser.authID == "admin"
  ) {
    const trId = req.params.trId;
    const filter = { trId: trId };
    const update = { status: "Payment failed ❌" };
    let approveTransaction = await transactionModel.findOneAndUpdate(
      filter,
      update
    );
    res.redirect("/pending");
  } else {
    res.redirect("/error");
  }
});

// GET LOGOUT
router.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/login");
});

module.exports = router;
