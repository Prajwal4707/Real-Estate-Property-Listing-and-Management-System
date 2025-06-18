import { config } from "../config/config.js";

class AIService {
  constructor() {
    this.openRouterApiKey = config.openRouterApiKey;
    this.openRouterBaseURL = "https://openrouter.ai/api/v1";
  }

  async generateText(prompt) {
    return this.generateTextWithOpenRouter(prompt);
  }

  async generateTextWithOpenRouter(prompt) {
    try {
      console.log(`Starting OpenRouter AI generation at ${new Date().toISOString()}`);
      const startTime = Date.now();
      
      const response = await fetch(`${this.openRouterBaseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.openRouterApiKey}`
        },
        body: JSON.stringify({
          model: "openai/gpt-3.5-turbo", // You can change to another model if desired
          messages: [
            { 
              role: "system", 
              content: "You are an AI real estate expert assistant that provides concise, accurate analysis of property data."
            },
            { 
              role: "user", 
              content: prompt 
            }
          ],
          temperature: 0.7,
          max_tokens: 800,
          top_p: 1
        })
      });

      const endTime = Date.now();
      console.log(`OpenRouter AI generation completed in ${(endTime - startTime) / 1000} seconds`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `OpenRouter API error: ${response.status}`);
      }
      
      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error("Error generating text with OpenRouter:", error);
      return `Error: ${error.message}`;
    }
  }

  // Helper method to filter and clean property data before analysis
  _preparePropertyData(properties, maxProperties = 3) {
    // Limit the number of properties
    const limitedProperties = properties.slice(0, maxProperties);
    
    // Clean and simplify each property
    return limitedProperties.map(property => ({
      building_name: property.building_name,
      property_type: property.property_type,
      location_address: property.location_address,
      price: property.price,
      area_sqft: property.area_sqft,
      // Extract just a few key amenities
      amenities: Array.isArray(property.amenities) 
        ? property.amenities.slice(0, 5) 
        : [],
      // Truncate description to save tokens
      description: property.description 
        ? property.description.substring(0, 150) + (property.description.length > 150 ? '...' : '')
        : ''
    }));
  }

  // Helper method to filter and clean location data
  _prepareLocationData(locations, maxLocations = 5) {
    // Limit the number of locations
    return locations.slice(0, maxLocations);
  }

  async analyzeProperties(
    properties,
    city,
    maxPrice,
    propertyCategory,
    propertyType
  ) {
    // Prepare limited and cleaned property data
    const preparedProperties = this._preparePropertyData(properties);

    const prompt = `As a real estate expert, analyze these properties:

        Properties Found in ${city}:
        ${JSON.stringify(preparedProperties, null, 2)}

        INSTRUCTIONS:
        1. Focus ONLY on these properties that match:
           - Property Category: ${propertyCategory}
           - Property Type: ${propertyType}
           - Maximum Price: ${maxPrice} crores
        2. Provide a brief analysis with these sections:
           - Property Overview (basic facts about each)
           - Best Value Analysis (which offers the best value)
           - Quick Recommendations

        Keep your response concise and focused on these properties only.
        `;

    return this.generateText(prompt);
  }

  async analyzeLocationTrends(locations, city) {
    // Prepare limited location data
    const preparedLocations = this._prepareLocationData(locations);

    const prompt = `As a real estate expert, analyze these location price trends for ${city}:

        ${JSON.stringify(preparedLocations, null, 2)}

        Please provide:
        1. A brief summary of price trends for each location
        2. Which areas are showing the highest appreciation
        3. Which areas offer the best rental yield
        4. Quick investment recommendations based on this data

        Keep your response concise (maximum 300 words).
        `;

    return this.generateText(prompt);
  }
}

export default new AIService();