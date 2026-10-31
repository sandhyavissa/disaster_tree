import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Support base64 image data up to 25MB for high-res field hazard photos
app.use(express.json({ limit: '25mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'DisasterTree Coordination Server (Visakhapatnam)',
  });
});

// Gemini AI Road Blockage Analysis endpoint
app.post('/api/analyze-blockage', async (req, res) => {
  const startTime = Date.now();
  try {
    const {
      description = '',
      locationName = '',
      routeType = 'Standard Road',
      imageBase64 = null,
      imageMimeType = 'image/jpeg',
    } = req.body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('GEMINI_API_KEY is not set. Using rule-based disaster triage scoring engine.');
      // Rule-based deterministic emergency fallback if key not configured
      const isWire = /wire|electric|pole|shock|cable|current|line/i.test(description);
      const isComplete = /complete|entire|both lane|blocked|closed|cutoff|impassable|trap/i.test(description);
      const isHospital = /hospital|medical|emergency|lifeline|artery/i.test(routeType + ' ' + description);

      let score = 5.0;
      if (isHospital) score += 2.5;
      if (isWire) score += 2.2;
      if (isComplete) score += 1.8;
      score = Math.min(10.0, Math.max(1.0, Math.round(score * 10) / 10));

      const obstruction = isComplete ? 'complete_block' : 'single_lane';
      const hazard = isWire ? 'live_electrical_wire' : 'none';
      const recommendation = isWire
        ? 'Dispatch PWD Heavy Chainsaw Unit + APEPDCL Electricity Board urgently.'
        : isHospital
        ? 'Priority 1 Hospital Corridor: Deploy Quick Response Municipal Tree Clearance Squad.'
        : 'Dispatch Municipal Tree Pruning Squad with front-loader tractor.';

      return res.json({
        success: true,
        source: 'rule_based_fallback',
        analysis: {
          obstruction,
          hazard,
          priority_score: score,
          recommendation,
        },
        latencyMs: Date.now() - startTime,
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const parts: any[] = [];

    if (imageBase64) {
      // Clean base64 string if data url prefix is present
      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
      parts.push({
        inlineData: {
          mimeType: imageMimeType || 'image/jpeg',
          data: cleanBase64,
        },
      });
    }

    const textPrompt = `You are an emergency municipal disaster response commander in Visakhapatnam, Andhra Pradesh, India.
Analyze this post-storm fallen tree / road blockage report:
- Location / Landmark: ${locationName || 'Visakhapatnam Municipal Road'}
- Corridor Classification: ${routeType}
- Field Observer Notes: "${description || 'Fallen tree blocking roadway after coastal storm'}"

Evaluate the visual damage and field text to provide:
1. "obstruction": Categorize as "complete_block", "single_lane", or "partial_block".
2. "hazard": Identify acute secondary hazards: "live_electrical_wire", "waterlogging", "structural_damage", or "none".
3. "priority_score": A floating point score from 1.0 to 10.0.
   - Critical (9.0 - 10.0): Hospital lifelines, emergency shelter corridors, or fallen trees entangled with live electrical lines / transformers.
   - High (7.0 - 8.9): Complete blockage of major arterial transit routes (e.g. Maddilapalem, Siripuram, NH16, Akkayyapalem 100ft road).
   - Moderate (4.0 - 6.9): Single-lane blocks on standard or residential roads.
   - Minor (1.0 - 3.9): Sidewalk or partial lane obstruction on non-critical commercial roads.
4. "recommendation": A concise, actionable crew dispatch order in simple English (mention specific agencies like PWD heavy unit, APEPDCL Electricity Board, or Municipal Tree Squad).

Reply strictly in JSON matching the schema.`;

    parts.push({ text: textPrompt });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: { parts },
      config: {
        systemInstruction:
          'You are DisasterTree AI, an emergency civic infrastructure specialist for Visakhapatnam Municipal Corporation (GVMC). Output strict JSON only in simple English.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            obstruction: {
              type: Type.STRING,
              description: 'Level of blockage: complete_block, single_lane, or partial_block',
            },
            hazard: {
              type: Type.STRING,
              description: 'Detected secondary hazard: live_electrical_wire, waterlogging, structural_damage, or none',
            },
            priority_score: {
              type: Type.NUMBER,
              description: 'Emergency priority score from 1.0 to 10.0',
            },
            recommendation: {
              type: Type.STRING,
              description: 'Clear, concise crew dispatch recommendation in simple English',
            },
          },
          required: ['obstruction', 'hazard', 'priority_score', 'recommendation'],
        },
      },
    });

    const rawText = response.text || '{}';
    const parsed = JSON.parse(rawText);

    // Ensure valid bounds
    const priorityScore = typeof parsed.priority_score === 'number'
      ? Math.min(10, Math.max(1, Math.round(parsed.priority_score * 10) / 10))
      : 7.0;

    return res.json({
      success: true,
      source: 'gemini_3.8_flash',
      analysis: {
        obstruction: parsed.obstruction || 'complete_block',
        hazard: parsed.hazard || 'none',
        priority_score: priorityScore,
        recommendation: parsed.recommendation || 'Dispatch Municipal Tree Pruning Squad for urgent clearance.',
      },
      latencyMs: Date.now() - startTime,
    });
  } catch (error: any) {
    console.error('Error analyzing blockage with Gemini:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to analyze blockage report with AI.',
      latencyMs: Date.now() - startTime,
    });
  }
});

// Setup dev server with Vite middlewares or production static serving
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`DisasterTree server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
