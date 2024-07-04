// import dotenv from "dotenv";
const dotenv = require("dotenv");

const connectDB = require("./db");
const app = require("./app");
dotenv.config();

connectDB()
  .then(() => {
    app.listen(process.env.PORT || 8080, () => {
      console.log(
        `Server is running on http://localhost:${process.env.PORT} in ${process.env.NODE_ENV} mode`
      );
    });
  })
  .catch((err) => console.log("DB CONNECTION FAILED: ", err));
