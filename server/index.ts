import express from "express";
import cors from "cors";
import { registerRoutes } from "./routes";

const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Register routes
registerRoutes(app).then(() => {
  app.listen(port, '0.0.0.0', () => {
    console.log(`Birmingham Kids server running on port ${port}`);
  });
}).catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
