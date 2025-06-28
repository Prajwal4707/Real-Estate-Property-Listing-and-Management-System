import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import Property from "../models/propertymodel.js";
const router = express.Router();
dotenv.config({ path: './.env' });

router.post("/", async (req, res) => {
  const { messages } = req.body; // [{role: "user", content: "..."}]
  const apiKey = process.env.OPENROUTER_API_KEY;
  const endpoint = "https://openrouter.ai/api/v1/chat/completions";

  // Fetch a few properties from the database
  let propertySummary = "";
  try {
    // const properties = await Property.find({ isBlocked: false }).limit(50);    //only accesses first 50 properties
    const properties = await Property.find({ isBlocked: false });
    if (properties.length > 0) {
      propertySummary = properties.map((p, i) =>
        `${i + 1}. ${p.title}\n   Location: ${p.location}\n   Price: ₹${p.price}\n   Bedrooms: ${p.beds}\n   Bathrooms: ${p.baths}\n   Area: ${p.sqft} sqft`
      ).join('\n\n');
    } else {
      propertySummary = "No properties are currently listed.";
    }
  } catch (err) {
    propertySummary = "(Could not load property data.)";
  }

  // Build the system prompt
  const systemPrompt = `You are BuildBot, a helpful real estate assistant for BuildEstate.

Here are some of our current property listings (please keep the formatting as a simple numbered list, do not add headings or extra Markdown):

${propertySummary}

If the user's question matches one of these properties, use the details provided. If not, answer using your general real estate knowledge and best practices.`;

  // Prepend the system prompt to the messages
  const aiMessages = [
    { role: "system", content: systemPrompt },
    ...messages
  ];

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "openai/gpt-4.1", // or another model available on OpenRouter
        messages: aiMessages,
        max_tokens: 400,
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    console.log("OpenRouter API response:", data); // Log the full response

    if (!data.choices || !data.choices[0]) {
      return res.status(500).json({ error: "No response from AI", details: data });
    }
    res.json({ reply: data.choices[0].message.content });
  } catch (error) {
    console.error("OpenRouter API error:", error); // Log the error
    res.status(500).json({ error: error.message });
  }
});

export default router; 