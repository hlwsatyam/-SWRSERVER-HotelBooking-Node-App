const JWT = require("jsonwebtoken");
const createJWT = (payload, securityCode, exipry) => {
  try {
    return JWT.sign(payload, securityCode, {
      expiresIn: exipry ? exipry : "10y",
    });
  } catch (error) {
    console.log("Error During JWT Creating", error);
  }
};
const varifyToken = () => {
  const varifyingResult = JWT.verify(token, securityCode);
  return varifyingResult;
};
module.exports = { createJWT, varifyToken };
