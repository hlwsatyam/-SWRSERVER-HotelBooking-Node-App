const mongoose = require("mongoose");

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Db Is Connected");
  })
  .catch((err) => console.log("Db Connection Error", err.message));