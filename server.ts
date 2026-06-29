import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

const app = express();
const PORT = 3000;

// Enable JSON body parser
app.use(express.json());

// Helper to obtain Gemini client safely
function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not configured on the server.");
  }
  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
}

const posterSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    authors: { type: Type.ARRAY, items: { type: Type.STRING } },
    affiliation: { type: Type.STRING },
    introduction: { type: Type.ARRAY, items: { type: Type.STRING } },
    objectives: { type: Type.ARRAY, items: { type: Type.STRING } },
    methods: { type: Type.ARRAY, items: { type: Type.STRING } },
    demographics: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          label: { type: Type.STRING },
          value: { type: Type.STRING }
        },
        required: ["label", "value"]
      }
    },
    speciesDistribution: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          value: { type: Type.NUMBER }
        },
        required: ["name", "value"]
      }
    },
    treatmentData: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          value: { type: Type.NUMBER }
        },
        required: ["name", "value"]
      }
    },
    outcomes: {
      type: Type.OBJECT,
      properties: {
        withTreatment: { type: Type.NUMBER },
        withoutTreatment: { type: Type.NUMBER },
        pValue: { type: Type.STRING },
        finding: { type: Type.STRING },
        statisticalStatements: { 
          type: Type.ARRAY, 
          items: { type: Type.STRING },
          description: "Extract exact sentences containing statistical analysis results like Odds Ratio (OR), Confidence Interval (CI), and p-values from the text."
        },
        subgroupAnalysis: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              group: { type: Type.STRING },
              valueA: { type: Type.NUMBER },
              valueB: { type: Type.NUMBER }
            },
            required: ["group", "valueA", "valueB"]
          }
        }
      },
      required: ["withTreatment", "withoutTreatment", "pValue", "finding", "statisticalStatements", "subgroupAnalysis"]
    },
    conclusions: { type: Type.ARRAY, items: { type: Type.STRING } }
  },
  required: ["title", "authors", "affiliation", "introduction", "objectives", "methods", "demographics", "speciesDistribution", "treatmentData", "outcomes", "conclusions"]
};

// API Route to parse medical abstracts using Gemini
app.post("/api/parse-abstract", async (req, res) => {
  const { abstractText } = req.body;
  if (!abstractText || typeof abstractText !== "string") {
    res.status(400).json({ error: "abstractText is required as a string." });
    return;
  }

  try {
    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: `Transform this clinical abstract into a structured format for a medical congress poster. 
      Synthesize information for clarity, but for the 'statisticalStatements' field, YOU MUST EXTRACT THE EXACT SENTENCES from the abstract that mention statistical results (OR, CI, p-values). 
      If there are multiple comparisons or tests, provide each one as a separate string in the array.
      
      Abstract: ${abstractText}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: posterSchema,
      }
    });

    if (!response.text) {
      throw new Error("No response generated from the model.");
    }

    res.json(JSON.parse(response.text));
  } catch (err: any) {
    console.error("Gemini parse error:", err);
    res.status(500).json({ error: err.message || "Failed to call Gemini API" });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
