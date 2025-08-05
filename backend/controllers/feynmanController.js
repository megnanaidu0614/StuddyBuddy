const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Test endpoint to check API key and quotas
const testGeminiAPI = async (req, res) => {
  try {
    console.log('=== TESTING GEMINI API ===');
    console.log('GEMINI_API_KEY exists:', !!process.env.GEMINI_API_KEY);
    console.log('GEMINI_API_KEY length:', process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.length : 0);
    
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const result = await model.generateContent("Hello, this is a test. Please respond with 'API is working' if you can see this message.");
    const response = await result.response;
    const text = response.text();
    
    console.log('Test response:', text);
    
    res.status(200).json({
      success: true,
      message: 'API is working',
      response: text
    });
  } catch (error) {
    console.error('Test failed:', error.message);
    res.status(500).json({
      success: false,
      message: 'API test failed',
      error: error.message
    });
  }
};

const analyzeFeynmanExplanation = async (req, res) => {
  try {
    console.log('=== FEYNMAN ANALYSIS REQUEST ===');
    console.log('Request body:', req.body);
    console.log('GEMINI_API_KEY exists:', !!process.env.GEMINI_API_KEY);
    console.log('GEMINI_API_KEY length:', process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.length : 0);
    
    const { topic, explanation } = req.body;
    
    if (!topic || !explanation) {
      console.log('Missing topic or explanation');
      return res.status(400).json({ 
        message: 'Topic and explanation are required' 
      });
    }

    // Create a comprehensive prompt for the Feynman technique analysis
    const prompt = `You are an expert educator using the Feynman Technique to evaluate a student's understanding of a topic. 

TOPIC: ${topic}

STUDENT'S EXPLANATION:
${explanation}

Please analyze this explanation using the Feynman Technique principles and provide a comprehensive evaluation in the following JSON format:

{
  "understandingScore": <number 1-10>,
  "strengths": ["<strength1>", "<strength2>", "<strength3>"],
  "weaknesses": ["<weakness1>", "<weakness2>", "<weakness3>"],
  "improvementSuggestions": ["<suggestion1>", "<suggestion2>", "<suggestion3>"],
  "conceptualGaps": ["<gap1>", "<gap2>"],
  "applicationAbility": "<assessment of ability to apply knowledge>",
  "overallFeedback": "<comprehensive feedback paragraph>",
  "nextSteps": ["<next step 1>", "<next step 2>", "<next step 3>"]
}

EVALUATION CRITERIA:
1. **Understanding Score (1-10)**: Rate based on clarity, accuracy, depth, and ability to explain complex concepts simply
2. **Strengths**: Identify what the student explained well, clear concepts, good examples, logical flow
3. **Weaknesses**: Identify gaps, misconceptions, unclear explanations, missing key concepts
4. **Improvement Suggestions**: Specific, actionable advice to enhance understanding
5. **Conceptual Gaps**: Fundamental concepts that seem to be missing or misunderstood
6. **Application Ability**: Assess if they can apply this knowledge to solve problems or explain to others
7. **Overall Feedback**: A comprehensive paragraph summarizing their current level and what they should focus on
8. **Next Steps**: Specific actions they should take to improve their understanding

Focus on:
- Whether they truly understand the concepts or just memorized facts
- Their ability to explain complex ideas simply
- Whether they can apply the knowledge to new situations
- The logical flow and coherence of their explanation
- Any misconceptions or gaps in fundamental understanding

Provide honest, constructive feedback that will help them improve their understanding.`;

    // Generate content using Gemini
    console.log('About to call Gemini API...');
    
    // Try different model names in case one doesn't work
    let model, result, response, text;
    const modelNames = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro"];
    
    for (const modelName of modelNames) {
      try {
        console.log(`Trying model: ${modelName}`);
        model = genAI.getGenerativeModel({ model: modelName });
        console.log('Model created, generating content...');
        
        // Add a small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        result = await model.generateContent(prompt);
        console.log('Content generated, getting response...');
        response = await result.response;
        text = response.text();
        console.log('Response received, length:', text.length);
        break; // If successful, break out of the loop
      } catch (modelError) {
        console.log(`Model ${modelName} failed:`, modelError.message);
        
        // Check if it's a quota error
        if (modelError.message.includes('429') || modelError.message.includes('quota')) {
          console.log('Quota limit reached, trying next model...');
          if (modelName === modelNames[modelNames.length - 1]) {
            throw new Error('All models have reached their quota limits. Please try again later or upgrade your API plan.');
          }
          // Add a longer delay before trying the next model
          await new Promise(resolve => setTimeout(resolve, 2000));
          continue;
        }
        
        if (modelName === modelNames[modelNames.length - 1]) {
          // If this was the last model, throw the error
          throw modelError;
        }
        // Otherwise, continue to the next model
      }
    }

    // Try to parse the JSON response
    let analysis;
    try {
      // Extract JSON from the response (in case there's extra text)
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Error parsing Gemini response:', parseError);
      console.log('Raw response:', text);
      return res.status(500).json({ 
        message: 'Error parsing AI response',
        rawResponse: text 
      });
    }

    // Validate the response structure
    const requiredFields = [
      'understandingScore', 'strengths', 'weaknesses', 
      'improvementSuggestions', 'conceptualGaps', 
      'applicationAbility', 'overallFeedback', 'nextSteps'
    ];

    for (const field of requiredFields) {
      if (!analysis[field]) {
        return res.status(500).json({ 
          message: `Invalid AI response: missing ${field}`,
          rawResponse: text 
        });
      }
    }

    res.status(200).json({
      success: true,
      analysis,
      topic,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Feynman analysis error:', error);
    res.status(500).json({ 
      message: 'Error analyzing explanation',
      error: error.message 
    });
  }
};

module.exports = { analyzeFeynmanExplanation, testGeminiAPI }; 