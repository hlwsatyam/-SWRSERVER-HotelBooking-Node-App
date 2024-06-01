const JWT = require("jsonwebtoken");
const guestAuthentication = (req, res, next) => {
  const { token } = req.body;
  try {
    JWT.verify(token, process.env.JWTSecurityCode, (err, decoded) => {
      if (err) {
        res.status(401).json({ message: "Invalid token", status: false });
      }
      req.user = decoded.id;
      next();
    });
  } catch (error) {
    res.status(503).json({ message: "something went wrong", status: false });
  }
};
module.exports = { guestAuthentication };