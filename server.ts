import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Use body-parsing middleware
  app.use(express.json());

  // API Route for Joint Commission Standards Classification Specialist (Agent 1)
  app.post("/api/classify", async (req, res) => {
    try {
      const { finding, standardsDb } = req.body;
      if (!finding) {
        res.status(400).json({ error: "Missing required 'finding' object in request body." });
        return;
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        // Return 412 Precondition Failed to indicate missing configuration
        res.status(412).json({
          error: "GEMINI_API_KEY environment variable is not configured. Please add your key in the AI Studio Settings secrets panel to enable live AI analysis.",
          fallback: true
        });
        return;
      }

      // Read Agent 1 Prompt file
      const promptPath = path.join(process.cwd(), "src", "prompts", "agent1.txt");
      let systemInstruction = "";
      if (fs.existsSync(promptPath)) {
        systemInstruction = fs.readFileSync(promptPath, "utf-8");
      } else {
        systemInstruction = "You are the Standards Classification Specialist. Analyze the ambulatory Joint Commission mock survey finding and map it to the most appropriate JCI Chapter, Standard, and Element of Performance (EP).";
      }

      // Initialize Google GenAI lazily
      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          }
        }
      });

      // Construct a concise database context of JCI Standards for the AI model to prevent hallucination
      const standardsContext = JSON.stringify(standardsDb || {}, null, 2);

      const prompt = `
Please classify the following survey finding based on the JCI Standards knowledge base provided below.

==================================================
SURVEY FINDING TO CLASSIFY:
Finding ID: ${finding.id}
Date: ${finding.date}
Clinic/Location: ${finding.clinic}
Department/Area: ${finding.department}
Observation Description: "${finding.description}"
==================================================

==================================================
AUTHORITATIVE STANDARDS REFERENCE KNOWLEDGE BASE:
${standardsContext}
==================================================

Analyze the finding according to the 3-step regulatory reasoning:
Step 1: Identify the object/process/condition observed.
Step 2: Identify the broader regulatory concept.
Step 3: Map to the standards database or perform provisional classification if needed.

Provide a complete JCI Standards Classification JSON object following the schema defined:
{
  "primaryChapter": "Chapter Name",
  "primaryStandard": "Standard Code (e.g., MM.03.01.01)",
  "primaryEP": "EP Number (e.g., EP 2)",
  "epLanguage": "Verbatim EP language",
  "regulatoryRationale": "Explanatory narrative of observed facts, regulatory inference, and assumptions",
  "confidenceScore": 90, 
  "humanReviewStatus": "Review Not Required" | "Review Recommended" | "Review Required" | "Unable to Determine",
  "additionalInfoNeeded": "Any additional information needed if confidence is low",
  "secondaryStandard": "Optional second standard code if applicable"
}
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              primaryChapter: {
                type: Type.STRING,
                description: "Primary JCI Chapter Name"
              },
              primaryStandard: {
                type: Type.STRING,
                description: "Primary JCI Standard ID (e.g., MM.03.01.01)"
              },
              primaryEP: {
                type: Type.STRING,
                description: "Primary JCI Element of Performance (e.g., EP 2)"
              },
              epLanguage: {
                type: Type.STRING,
                description: "Verbatim EP text from JCI reference documents"
              },
              regulatoryRationale: {
                type: Type.STRING,
                description: "Explanatory rationale translating the observed finding into regulatory concepts"
              },
              confidenceScore: {
                type: Type.INTEGER,
                description: "Confidence level score from 0 to 100"
              },
              humanReviewStatus: {
                type: Type.STRING,
                description: "Status indicating whether a human needs to review the classification"
              },
              additionalInfoNeeded: {
                type: Type.STRING,
                description: "Operational/clinical details needed from the clinic to refine classification"
              },
              secondaryStandard: {
                type: Type.STRING,
                description: "Optional secondary standard if multiple apply"
              }
            },
            required: ["primaryChapter", "primaryStandard", "primaryEP", "epLanguage", "regulatoryRationale", "confidenceScore", "humanReviewStatus"]
          }
        }
      });

      const responseText = response.text || "";
      const result = JSON.parse(responseText.trim());
      res.json(result);
    } catch (error: any) {
      console.error("[Classifier API Error]:", error);
      res.status(500).json({
        error: error.message || "An error occurred while executing the Standards Classification Specialist.",
        fallback: true
      });
    }
  });

  // Serve Vite in development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] Running on http://localhost:${PORT} in ${process.env.NODE_ENV || "development"} mode`);
  });
}

startServer();
