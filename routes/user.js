const express = require("express");
const connection = require("../connection");
const router = express.Router();

const jwt = require("jsonwebtoken");
require("dotenv").config();

router.post("/signup", (req, res) => {
  let user = req.body;
  query = "select email,password,role,status from user where email=?";
  connection.query(query, [user.email], (err, results) => {
    if (!err) {
      if (results.length <= 0) {
        query =
          "insert into user(name,contactNumber,email,password,status,role) values(?,?,?,?,'false','user')";
        connection.query(
          query,
          [user.name, user.contactNumber, user.email, user.password],
          (err, results) => {
            if (!err) {
              return res
                .status(200)
                .json({ message: "Successfully Registered." });
            } else {
              return res.status(500).json(err);
            }
          }
        );
      } else {
        return res.status(400).json({ message: "Email Already Exists." });
      }
    } else {
      return res.status(500).json(err);
    }
  });
});

router.post("/login", (req, res) => {
  const user = req.body;
  query = "select email,password,role,status from user where email=?";
  connection.query(query, [user.email], (err, results) => {
    if (!err) {
      if (results.length <= 0 || results[0].password != user.password) {
        return res
          .status(401)
          .json({ message: "Incorrect Username or Password." });
      } else if (results[0].status === "false") {
        return res.status(401).json({ message: "Wait for Admin Approval" });
      } else if (results[0].password == user.password) {
        const response = { email: results[0].email, role: results[0].role };
        const accessToken = jwt.sign(response, process.env.ACCESS_TOKEN, {
          expiresIn: "8h",
        });
        res.status(200).json({ token: accessToken });
      } else {
        return res
          .status(400)
          .json({ message: "Something Went Wrong. Please Try Again Later." });
      }
    } else {
      return res.status(500).json(err);
    }
  });
});

var transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: process.env.EMAIL, pass: process.env.PASSWORD },
});

router.post("/forgotpassword", (req, res) => {
  const user = req.body;
  query = "select email,password from user where email=?";
  connection.query(query, [user.email], (err, results) => {
    if (!err) {
      if (results.length <= 0) {
        return res
          .status(200)
          .json({ message: "Password Sent Successfully to Your Email." });
      } else {
        var mailOptionis = {
          from: process.env.EMAIL,
          to: results[0].email,
          subject: "Password Reset Request for Cafe Management System",
          html: "<p><b> Your Login details for Cafe Management System</b><br><b>Email : </b> '+ results[0].email+'<br><b>Password : </b> '+ results[0].password+'<br> <a href='http://ec2-54-144-215-218.compute-1.amazonaws.com:4200'> Click here to Login</a> </p>;",
        };
        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            console.log(error);
          } else {
            console.log("Email Sent : " + info.response);
          }
        });
      }
    } else {
      return res.status(500).json(err);
    }
  });
});
module.exports = router;
