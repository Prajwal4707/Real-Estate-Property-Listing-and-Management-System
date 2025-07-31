import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import Property from "../models/propertymodel.js";
const router = express.Router();
dotenv.config({ path: './.env' });

router.post("/", async (req, res) => {
  try {
    console.log("Chat request received:", req.body);
    
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({
        error: "Invalid request format",
        details: "Messages array is required"
      });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      console.error("OpenRouter API key is missing");
      return res.status(500).json({
        error: "Configuration error",
        details: "API key is not configured"
      });
    }

    console.log("Using OpenRouter API key:", apiKey.substring(0, 5) + "...");
    const endpoint = "https://api.openrouter.ai/api/v1/chat/completions";

  // Fetch a few properties from the database
  let propertySummary = "";
  try {
    // Limit to first 50 properties to avoid overwhelming responses
    const properties = await Property.find({ isBlocked: false }).limit(50);
    console.log(`Found ${properties.length} properties in database`);
    
    if (properties.length > 0) {
      propertySummary = properties.map((p, i) => {
        const formattedProperty = `${i + 1}. ${p.title}\n   Location: ${p.location}\n   Price: ₹${p.price}\n   Bedrooms: ${p.beds}\n   Bathrooms: ${p.baths}\n   Area: ${p.sqft} sqft\n   View Property: /properties/single/${p._id}`;
        console.log(`Property ${i + 1}: ${p.title} (ID: ${p._id})`);
        return formattedProperty;
      }).join('\n\n');
      
      console.log("Generated propertySummary:", propertySummary);
    } else {
      propertySummary = "No properties are currently listed.";
    }
  } catch (err) {
    console.error("Error fetching properties:", err);
    propertySummary = "(Could not load property data.)";
  }

  // Build the system prompt
  const systemPrompt = `You are BuildBot, a helpful real estate assistant for BuildEstate.

Here are some of our current property listings with sequential numbering:

${propertySummary}

CRITICAL FORMATTING REQUIREMENTS:
- You MUST use the exact sequential numbering shown above (1., 2., 3., etc.)
- NEVER use different numbers or skip numbers
- ALWAYS start with "1." and continue sequentially
- Maintain the exact format: "Number. Title" followed by details on new lines
- Each property must be separated by a blank line
- Keep the same indentation and structure as shown above

When listing properties, you MUST use the sequential numbering from the list above. Do not reference properties by any other numbers or IDs. Always use the format shown in the property list.

If the user asks about properties in a specific location, list them using the sequential numbers from the provided list. If the user's question doesn't match these properties, answer using your general real estate knowledge.`;

  // Prepend the system prompt to the messages
  const aiMessages = [
    { role: "system", content: systemPrompt },
    ...messages
  ];

  try {
    console.log("Sending request to OpenRouter with messages:", aiMessages);
    
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": "https://buildestate-frontend.vercel.app",
        "X-Title": "BuildEstate Chat"
      },
      body: JSON.stringify({
        model: "anthropic/claude-2", // Using a more reliable model
        messages: aiMessages,
        max_tokens: 500,
        temperature: 0.7,
        headers: {
          "HTTP-Referer": "https://buildestate-frontend.vercel.app",
          "X-Title": "BuildEstate Chat"
        }
      }),
    });

    const data = await response.json();
    console.log("OpenRouter API response status:", response.status);
    console.log("OpenRouter API response:", data);

    if (!response.ok) {
      console.error("OpenRouter API error:", data);
      return res.status(response.status).json({
        error: "AI Service Error",
        details: data.error?.message || "Unknown error occurred",
        status: response.status
      });
    }

    if (!data.choices || !data.choices[0]) {
      console.error("Invalid response format:", data);
      return res.status(500).json({
        error: "Invalid AI Response",
        details: "No choices in response",
        data: data
      });
    }
    
    let reply = data.choices[0].message.content;
    console.log("AI response:", reply);
    
    // Post-process the response to ensure proper sequential numbering
    // Look for any numbered property references and convert them to sequential numbering
    const lines = reply.split('\n');
    let propertyCount = 0;
    const processedLines = lines.map(line => {
      // Check if line starts with a number followed by a period (any number)
      // Also handle variations like "1)" or "1 -" or "1:"
      const match = line.match(/^(\d+)[\.\)\-\:]\s*(.*)/);
      if (match) {
        propertyCount++;
        console.log(`Found property line: "${line}" -> Converting to "${propertyCount}. ${match[2]}"`);
        return `${propertyCount}. ${match[2]}`;
      }
      return line;
    });
    
    // If we found any numbered properties, use the processed version
    if (propertyCount > 0) {
      reply = processedLines.join('\n');
      console.log("Processed response with sequential numbering:", reply);
    }
    
    res.json({ reply });
  } catch (error) {
    console.error("Chat route error:", {
      message: error.message,
      stack: error.stack,
      response: error.response?.data
    });
    
    // Send a more detailed error response
    res.status(500).json({
      error: "Chat processing failed",
      details: error.message,
      type: error.name,
      timestamp: new Date().toISOString()
    });
  }
});

// Test endpoint to verify property formatting
router.get("/test-properties", async (req, res) => {
  try {
    const properties = await Property.find({ isBlocked: false }).limit(5);
    const formattedProperties = properties.map((p, i) => ({
      number: i + 1,
      title: p.title,
      location: p.location,
      price: p.price,
      beds: p.beds,
      baths: p.baths,
      sqft: p.sqft
    }));
    
    res.json({
      message: "Property formatting test",
      properties: formattedProperties,
      formattedText: properties.map((p, i) => 
        `${i + 1}. ${p.title}\n   Location: ${p.location}\n   Price: ₹${p.price}\n   Bedrooms: ${p.beds}\n   Bathrooms: ${p.baths}\n   Area: ${p.sqft} sqft`
      ).join('\n\n')
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router; 