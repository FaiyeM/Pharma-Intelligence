import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Helper to safely get the Gemini Client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY is not defined. Please configure your API Key in Settings > Secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// -------------------------------------------------------------
// API Route 1: CRM Smart Co-pilot / Assistant
// -------------------------------------------------------------
app.post("/api/copilot", async (req, res) => {
  try {
    const { message, history, crmContext } = req.body;
    const ai = getGeminiClient();

    const formattedContext = JSON.stringify(crmContext, null, 2);

    const systemInstruction = `You are VEEVA-AI, a world-class Pharma CRM Intelligent Assistant and Field Sales Coach.
Your goal is to assist pharmaceutical sales representatives in planning their territory visits, optimizing doctor engagement, drafting follow-up emails, and retrieving clinical info.

You have access to the current CRM state (HCP details, Products detailed, Call logs, Events, and Sample inventories) in JSON format below:
<CRM_CONTEXT>
${formattedContext}
</CRM_CONTEXT>

Guidelines:
1. Be highly professional, structured, and action-oriented. Match the terminology of life sciences and pharmaceutical compliance (e.g. HCP, HCO, CLM, KOL, detailings, sample drops, compliance, MACE, PFS, clinical endpoints, hazard ratios).
2. When answering queries about HCPs, reference specific history, segment ratings (A, B, C), or preferences shown in the context.
3. If asked to draft a clinical follow-up email, format it professionally: include Subject line, personalized salutation, clear summary of clinical trials mentioned (EPIC-4 for CardioGard, SIRIUS-3 for OncoShield, ZENITH for NeuroMed), specific reference to doctor concerns (e.g. bleeding risk or titration), and polite call to action.
4. Keep answers clean, scannable, using markdown bullets and bold terms. Avoid mentioning that you are an AI model unless necessary; embrace your VEEVA-AI identity.`;

    const contents = history ? [...history, { role: "user", parts: [{ text: message }] }] : message;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Error in VEEVA-AI Copilot:", error);
    res.status(500).json({ error: error.message || "Failed to generate copilot response." });
  }
});

// -------------------------------------------------------------
// API Route 2: Generate Clinical Briefing
// -------------------------------------------------------------
app.post("/api/clinical-brief", async (req, res) => {
  try {
    const { hcp, products, logs } = req.body;
    const ai = getGeminiClient();

    if (!hcp) {
      return res.status(400).json({ error: "HCP profile is required." });
    }

    const hcpDataStr = JSON.stringify(hcp, null, 2);
    const productsDataStr = JSON.stringify(products, null, 2);
    const logsDataStr = JSON.stringify(logs, null, 2);

    const prompt = `You are a Pharma Field Sales Planner. Generate a concise, high-impact "Pre-Visit Briefing" for a sales rep visiting this Healthcare Professional (HCP).

HCP PROFILE:
${hcpDataStr}

PRODUCTS IN OUR PORTFOLIO:
${productsDataStr}

RECENT INTERACTION LOGS:
${logsDataStr}

Generate a beautifully formatted markdown brief with the following structured sections:
1. **Strategic Profile Summary**: Highlight segment value (A, B, C), clinician stance/preferences, and key influence.
2. **Key Challenges & Objections**: Identify concerns raised previously (e.g. safety, cost, clinical evidence).
3. **Detailing Recommendation**: Recommend specific products and exactly which detailing slide to show from our portfolio.
4. **Suggested Pitch Script (Verbatim)**: Provide a 1-minute elevator pitch with conversational transition questions designed to handle objections.
5. **Call Objective & Target Drops**: Suggest realistic targets (e.g., sample starters, event speaker invitations, MSL follow-up).

Be concise, highly practical, and motivating for the sales rep.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        temperature: 0.6,
      },
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Error generating clinical brief:", error);
    res.status(500).json({ error: error.message || "Failed to generate brief." });
  }
});

// -------------------------------------------------------------
// API Route 3: Roleplay Practice Pitch Coach
// -------------------------------------------------------------
app.post("/api/roleplay", async (req, res) => {
  try {
    const { hcpName, specialty, segment, product, history, latestMessage } = req.body;
    const ai = getGeminiClient();

    if (!hcpName || !product) {
      return res.status(400).json({ error: "HCP Name and Product are required for roleplay." });
    }

    const systemInstruction = `You are ${hcpName}, a highly respected physician specializing in ${specialty || "Medicine"}. Your target segment is ${segment || "A"} (very high standard).
The user is a pharmaceutical sales representative pitching ${product.name} (${product.therapeuticArea}, treating ${product.indication}).

Your characteristics:
1. You are busy, clinically rigorous, and skeptical of sales pitches. You only care about robust peer-reviewed evidence, safety/tolerability (especially side effects like bleeding, anemia, or somnolence depending on the therapeutic class), cost-efficacy, and patient adherence.
2. You ask challenging clinical questions. (e.g. "What is your hazard ratio?", "How does this compare head-to-head with standard of care?", "I have seen anemia in PARP inhibitors, why is yours different?", "My patients struggle with cost, how do we handle coverage?").
3. Keep your answers relatively short (2-3 sentences), simulating a quick conversation in your clinic hallway or during a brief office visit.
4. Be professional but guarded. Do not easily say yes. Force the sales rep to address your concerns with real data (e.g. EPIC-4 trial for CardioGard, SIRIUS-3 for OncoShield, ZENITH for NeuroMed).
5. At any time, if the rep pitches poorly or makes claims without evidence, call them out. If they explain the benefits perfectly and address your specific drug's trial results, show gradual interest.

Let's begin the roleplay. You start by greeting the rep briefly or asking them why they are stopping by today.`;

    const contents = history ? [...history, { role: "user", parts: [{ text: latestMessage }] }] : latestMessage;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents,
      config: {
        systemInstruction,
        temperature: 0.8,
      },
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Error in Roleplay Pitch Coach:", error);
    res.status(500).json({ error: error.message || "Failed to generate roleplay response." });
  }
});

// -------------------------------------------------------------
// Serve static frontend files and support SPA Routing
// -------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in DEVELOPMENT mode...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in PRODUCTION mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express Server running on port ${PORT}`);
  });
}

startServer();
