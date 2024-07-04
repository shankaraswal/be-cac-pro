const mongoose = require("mongoose");

const DB_NAME = "videos";

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}/videos`
    );

    console.log(`monog db connected : ${connectionInstance.connection.host}`);
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};
module.exports = connectDB;
