import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

const plugins = [];

// Only initialize Google AI plugin if API key is present
if (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY) {
  try {
    plugins.push(googleAI());
  } catch (error) {
    console.warn('Failed to initialize Google AI plugin:', error);
  }
}

export const ai = genkit({
  plugins,
  model: 'googleai/gemini-2.5-flash',
});
