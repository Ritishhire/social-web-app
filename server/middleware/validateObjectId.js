const mongoose = require("mongoose");


const validateObjectId = (paramName) => {
  return (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params[paramName])) {
      return res.status(400).json("Invalid ID");
    }
    next();
  };
};

module.exports = validateObjectId;