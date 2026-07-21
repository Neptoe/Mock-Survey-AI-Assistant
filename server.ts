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
        systemInstruction = "You are the Standards Classification Specialist. Analyze ambulatory Joint Commission mock survey findings and determine the most appropriate Joint Commission regulatory classification.";
      }

      // Retrieve relevant passages from the JCI Standards DB based on the description
      let retrievedPassages = "";
      if (standardsDb && typeof standardsDb === "object") {
        const descLower = finding.description.toLowerCase();
        const keywords = descLower.split(/[\s,.;()]+/).filter((w: string) => w.length > 3);
        const scoredEntries: any[] = [];

        for (const [key, ref] of Object.entries(standardsDb)) {
          const r = ref as any;
          const searchContent = `${r.chapter} ${r.standard} ${r.ep} ${r.epLanguage} ${r.rationale} ${r.defaultTrendDomain}`.toLowerCase();
          let score = 0;

          // Semantic boosters for specific keywords
          if (descLower.includes("eye") && (searchContent.includes("equipment") || searchContent.includes("environment"))) score += 6;
          if (descLower.includes("sprinkler") && (searchContent.includes("fire") || searchContent.includes("combustion"))) score += 6;
          if (descLower.includes("ceiling") && (searchContent.includes("care") || searchContent.includes("safety"))) score += 6;
          if (descLower.includes("wall") && (searchContent.includes("care") || searchContent.includes("safety"))) score += 6;
          if (descLower.includes("power strip") && (searchContent.includes("safety") || searchContent.includes("hazard"))) score += 6;
          if (descLower.includes("sticker") && (searchContent.includes("equipment") || searchContent.includes("inspect"))) score += 6;

          for (const word of keywords) {
            if (searchContent.includes(word)) {
              score += 1;
            }
          }

          if (score > 0) {
            scoredEntries.push({ key, ref: r, score });
          }
        }

        // Sort by relevance score
        scoredEntries.sort((a, b) => b.score - a.score);
        
        // Format the top matches as retrieved source passages
        const topMatches = scoredEntries.slice(0, 5);
        if (topMatches.length > 0) {
          retrievedPassages = topMatches.map(m => `[RECONSTRUCTED JCI ACCREDITATION REFERENCE SOURCE PASSAGE]
Reference Key: ${m.key}
Chapter: ${m.ref.chapter}
Standard: ${m.ref.standard}
EP: ${m.ref.ep}
EP Language: ${m.ref.epLanguage}
Rationale: ${m.ref.rationale}
Relevance Score: ${m.score}`).join("\n\n");
        } else {
          // Provide some standard passages as baseline context if no keyword matched
          retrievedPassages = Object.entries(standardsDb).slice(0, 4).map(([key, ref]: [string, any]) => `[RECONSTRUCTED JCI ACCREDITATION REFERENCE SOURCE PASSAGE]
Reference Key: ${key}
Chapter: ${ref.chapter}
Standard: ${ref.standard}
EP: ${ref.ep}
EP Language: ${ref.epLanguage}`).join("\n\n");
        }
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

      const prompt = `
Please classify the following ambulatory Joint Commission mock survey finding using the authoritative Standards Classification Specialist logic.

==================================================
MOCK SURVEY FINDING RECORD:
Finding ID: ${finding.id}
Finding Date: ${finding.date || "2026-07-20"}
Clinic Location: ${finding.clinic || "Ambulatory Clinic"}
Department/Area: ${finding.department || "General Practice"}
Observation Narrative: "${finding.description}"
==================================================

==================================================
RELEVANT RETRIEVED JOINT COMMISSION REFERENCE PASSAGES:
${retrievedPassages || "No matching reference documents found."}
==================================================

As the Standards Classification Specialist, you must perform deep concept mapping. Translate the specific walkthrough observation into broader regulatory domains.

Follow these strict rules:
1. Identify the Observed Object or Process and the Observed Deficiency.
2. Translate specific observations into Underlying Regulatory Concepts (e.g. Inspection, testing, maintenance, cleaning, documentation, etc.).
3. Identify candidate JCI Chapters, Standards, and EPs. Rank candidate classifications.
4. If the exact Standard or EP is uncertain but the object, process, and regulatory domain are reasonably clear, permit a "Provisional Classification" rather than returning "Unable to Determine" immediately. Return "Unable to Determine" ONLY if no defensible classification can be inferred.
5. Provide a clear Regulatory Rationale separating Observed Facts, Reasonable Regulatory Inference, and Assumptions Requiring Human Validation.

Return a JSON object conforming exactly to the following properties:
{
  "observedObjectOrProcess": "The physical object, equipment, or clinical process under observation (e.g., eye wash log, sprinkler head, power strip)",
  "observedDeficiency": "The specific gap or deficiency witnessed (e.g., missing documented filter changes, dusty)",
  "underlyingRegulatoryConcepts": "The broader clinical/operational concepts (e.g. inspection, testing, maintenance, ventilation, life safety)",
  "mostLikelyChapter": "Name of the most likely Joint Commission Chapter (e.g. Environment of Care (EC))",
  "primaryCandidateStandardAndEP": "The candidate code (e.g., EC.02.04.03 EP 2)",
  "secondaryCandidateStandardAndEP": "Optional secondary standard candidate if multiple apply, or 'None'",
  "confidenceScore": 85, // Integer 0 to 100
  "humanReviewStatus": "Review Not Required" | "Review Recommended" | "Review Required" | "Unable to Determine",
  "additionalInfoNeeded": "Additional clinical/procedural information required to confirm or refine this classification",
  "primaryChapter": "Chapter Name",
  "primaryStandard": "Standard code (e.g., EC.02.04.03)",
  "primaryEP": "EP number (e.g., EP 2)",
  "epLanguage": "Verbatim EP language corresponding to the selected classification",
  "regulatoryRationale": "Explanatory narrative. MUST include sections for: 'Observed Facts', 'Reasonable Regulatory Inference', and 'Assumptions Requiring Human Validation'"
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
              observedObjectOrProcess: { type: Type.STRING },
              observedDeficiency: { type: Type.STRING },
              underlyingRegulatoryConcepts: { type: Type.STRING },
              mostLikelyChapter: { type: Type.STRING },
              primaryCandidateStandardAndEP: { type: Type.STRING },
              secondaryCandidateStandardAndEP: { type: Type.STRING },
              confidenceScore: { type: Type.INTEGER },
              humanReviewStatus: { type: Type.STRING },
              additionalInfoNeeded: { type: Type.STRING },
              primaryChapter: { type: Type.STRING },
              primaryStandard: { type: Type.STRING },
              primaryEP: { type: Type.STRING },
              epLanguage: { type: Type.STRING },
              regulatoryRationale: { type: Type.STRING }
            },
            required: [
              "observedObjectOrProcess",
              "observedDeficiency",
              "underlyingRegulatoryConcepts",
              "mostLikelyChapter",
              "primaryCandidateStandardAndEP",
              "confidenceScore",
              "humanReviewStatus",
              "primaryChapter",
              "primaryStandard",
              "primaryEP",
              "epLanguage",
              "regulatoryRationale"
            ]
          }
        }
      });

      const responseText = response.text || "";
      const result = JSON.parse(responseText.trim());
      result.promptSent = prompt;
      result.retrievedPassages = retrievedPassages;
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
