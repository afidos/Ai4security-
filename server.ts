import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Mock Configuration
  const mockConfig = {
    serverUrl: "https://ais-dev-357cu6ek2sbxgdrq5nfcyw-439974435020.europe-west2.run.app",
    keywords: ["spyware", "hack", "intercept", "leak", "emergency"],
    blacklistNumbers: ["+1234567890", "+0987654321"],
    privacyLevel: "high",
    updateInterval: 60000
  };

  // API Routes
  app.get("/api/config", (req, res) => {
    res.json(mockConfig);
  });

  app.post("/api/alert/trigger", (req, res) => {
    const { risk_level, message, time_to_evacuate_minutes } = req.body;
    
    // In a real app, this would send an FCM push notification
    console.log(`[ALERT TRIGGERED] Level: ${risk_level}, Message: ${message}, Time: ${time_to_evacuate_minutes}m`);
    
    res.json({
      status: "success",
      message: "Alert broadcasted to device",
      timestamp: new Date().toISOString()
    });
  });

  app.post("/api/risk-assessment", (req, res) => {
    const { deviceData, commsData, locationData } = req.body;
    
    // Simple risk calculation logic
    let riskScore = 0;
    if (deviceData?.appsCount > 100) riskScore += 20;
    if (commsData?.unknownCalls > 5) riskScore += 30;
    if (locationData?.isAnomaly) riskScore += 40;

    let level = "LOW";
    if (riskScore > 70) level = "CRITICAL";
    else if (riskScore > 50) level = "HIGH";
    else if (riskScore > 20) level = "MEDIUM";

    res.json({
      overallRisk: level,
      score: riskScore,
      timestamp: new Date().toISOString(),
      recommendations: [
        "Review app permissions",
        "Enable two-factor authentication",
        "Avoid public Wi-Fi"
      ]
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
