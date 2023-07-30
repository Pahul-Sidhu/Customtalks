const jwt = require("jsonwebtoken");

const jwtstr = "AtmyDoors";

const givedetails = (req, res, next) => {
  let header = req.header("auth-token");
  if (!header) {
    return res.status(401).send({error : "Please give a correct token"});
  }

  try {
    let data = jwt.verify(header, jwtstr);
    req.user = data.user;
    next();
  } catch (error) {
    res.status(401).send({error : "Please give a correct token"});
  }

};

module.exports = givedetails;
