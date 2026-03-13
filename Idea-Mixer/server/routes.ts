import type { Express } from "express";
import { createServer, type Server } from "http";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.post("/api/mix", async (req, res) => {
    const {
      topics,
      context,
      temperature,
      diffInstruction,
      vibeInstruction,
      constraintInstruction,
    } = req.body;

    if (!topics || !Array.isArray(topics) || topics.length < 2) {
      return res.status(400).json({ ok: false, error: "Add at least 2 ingredients before mixing." });
    }

    const contextLine = context && context.trim()
      ? `Context: ${context.trim()}`
      : `Context: (none provided)`;

    const diff  = diffInstruction  || "Any buildability level is acceptable.";
    const vibe  = vibeInstruction  || "Balance creativity with practicality.";
    const twist = constraintInstruction && constraintInstruction.trim()
      ? `- Special instruction: ${constraintInstruction.trim()}`
      : "";

    const prompt = `You are the Idea Mixer — a creative bartender who distills topics into practical, buildable product ideas for anyone, regardless of background or experience.

Topics: ${topics.join(", ")}
${contextLine}

Your goal: combine ALL topics into ONE concrete, actionable product idea — something that could realistically be built or prototyped within a week.

Rules:
- The idea must be BUILDABLE, FUN, and USEFUL. Do not suggest anything that fails all three.
- Be specific — not "an app about X" but "a tool that does Y for Z people by doing W."
- If topics are inappropriate or offensive, return an error JSON.
- Bold 2-4 key words per field using **double asterisks**.
- For build steps: give exactly 3 short, practical steps (what to do first, second, third).
- Difficulty: ${diff}
- Creativity: ${vibe}${twist ? `\n${twist}` : ""}

Return ONLY a valid JSON object with exactly these fields:
{
  "ok": true,
  "name": "Short evocative cocktail-style name (max 6 words)",
  "tagline": "Spirited one-liner describing the idea (max 12 words)",
  "buildability": "YOUR HONEST ASSESSMENT — see scale below",
  "fun_factor": "YOUR HONEST ASSESSMENT — see scale below",
  "usefulness": "YOUR HONEST ASSESSMENT — see scale below",
  "concept": "2-3 sentences. Concrete description of WHAT the product IS. Bold 2-4 key nouns/verbs with **markers**.",
  "who": "1-2 sentences. Who benefits and what their world looks like today.",
  "problem": "1-2 sentences. The specific frustration or gap. Bold the core pain with **markers**.",
  "step1": "First practical build step. Start with a verb. Bold the key action with **markers**.",
  "step2": "Second practical step.",
  "step3": "Third step — something shareable or testable."
}

RATING SCALES — choose the value that honestly reflects the idea, not the most flattering one:

buildability: How hard is this actually to build?
  "Easy"     — a solo person could launch a working version in a weekend with minimal skills
  "Moderate" — requires a few weeks, some technical skill or coordination
  "Hard"     — significant engineering, data, infrastructure, or domain expertise required

fun_factor: Would people genuinely enjoy using this?
  "Plain"      — functional and useful but not particularly engaging
  "Interesting" — people would find it clever or satisfying to use
  "Delightful" — genuinely fun, surprising, or emotionally rewarding to interact with

usefulness: How often would people actually use this?
  "Unlikely"   — niche appeal or hard to fit into real workflows
  "Occasional" — useful a few times a month for specific situations
  "Habitual"   — something people would use weekly or daily as part of their routine

Be honest. Most ideas rate "Moderate" buildability. Not every idea is "Delightful" or "Habitual".

If topics are inappropriate or offensive, return:
{"ok": false, "error": "A short, polite explanation of why you cannot help."}

Respond ONLY in valid JSON. No markdown fences. No backticks. No extra text.`;

    const apiTemp = typeof temperature === "number" && temperature >= 0 && temperature <= 1
      ? temperature
      : 0.7;

    try {
     const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
     const result = await model.generateContent(prompt);
    let jsonStr = result.response.text().trim();
      jsonStr = jsonStr.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/, "");

      const data = JSON.parse(jsonStr);
      res.json(data);
    } catch (err) {
      console.error("Mix error:", err);
      res.status(500).json({ ok: false, error: "The shaker slipped — something went wrong. Please try again." });
    }
  });

  return httpServer;
}
