import express from "express";
import cors from "cors";
import * as dotenv from "dotenv";
dotenv.config();

import najemniciRoutes from "./routes/najemniciRoutes";
import nemovitostiRoutes from "./routes/nemovitostiRoutes";
import platbyRoutes from "./routes/platbyRoutes";
import meridlaRoutes from "./routes/meridlaRoutes";
import statistikyRoutes from "./routes/statistikyRoutes";
import ukolyRoutes from "./routes/ukolyRoutes";
import authRoutes from "./routes/authRoutes";
import apartmentRoutes from "./routes/apartmentsRoutes";
import { verifyConnection } from "./utils/email";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use("/api/najemnici", najemniciRoutes);
app.use("/api/nemovitosti", nemovitostiRoutes);
app.use("/api/platby", platbyRoutes);
app.use("/api/meridla", meridlaRoutes);
app.use("/api/statistiky", statistikyRoutes);
app.use("/api/ukoly", ukolyRoutes);
app.use("/api/apartments", apartmentRoutes);
app.use("/api/auth", authRoutes);

app.listen(PORT, async () => {
  console.log(`✅ Server běží na http://localhost:${PORT}`);
  await verifyConnection();
});
