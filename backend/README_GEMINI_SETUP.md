# Gemini API Setup for Feynman Technique

## Setup Instructions

1. **Get a Gemini API Key**:
   - Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Sign in with your Google account
   - Click "Create API Key"
   - Copy the generated API key

2. **Add to Environment Variables**:
   - Open your `.env` file in the backend directory
   - Add the following line:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```
   - Replace `your_api_key_here` with your actual Gemini API key

3. **Restart the Server**:
   - Stop your backend server (Ctrl+C)
   - Start it again with `npm run dev`

## Usage

Once set up, users can:
1. Navigate to the Feynman Technique page from the sidebar
2. Enter a topic they want to explain
3. Write their explanation as if teaching someone else
4. Submit for AI analysis
5. Receive detailed feedback on their understanding

## Features

- **Understanding Score**: Rated 1-10 based on clarity and depth
- **Strengths & Weaknesses**: Detailed analysis of explanation quality
- **Improvement Suggestions**: Actionable advice for better understanding
- **Conceptual Gaps**: Identifies missing fundamental concepts
- **Application Ability**: Assesses ability to apply knowledge
- **Next Steps**: Specific actions to improve understanding

## API Endpoint

- **POST** `/api/feynman/analyze`
- **Body**: `{ "topic": "string", "explanation": "string" }`
- **Response**: Detailed analysis in JSON format 