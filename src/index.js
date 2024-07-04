import dotenv from "dotenv";
import connectDB from "./db/index.js";
import app from "./app.js";

dotenv.config({
  path: "./.env",
});

connectDB()
  .then(() => {
    app.listen(process.env.PORT || 8080, () => {
      console.log(
        `Server is running on http://localhost:${process.env.PORT} in ${process.env.NODE_ENV} mode`
      );
    });
  })
  .catch((err) => console.log("DB CONNECTION FAILED: ", err));
