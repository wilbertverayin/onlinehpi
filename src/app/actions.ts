// AI features disabled for static build
import { TextToSpeechInput, TextToSpeechOutput, textToSpeech } from '@/ai/flows/text-to-speech';

export async function textToSpeechAction(input: TextToSpeechInput): Promise<TextToSpeechOutput | null> {
  try {
    const result = await textToSpeech(input);
    return result;
  } catch (error) {
    console.error("Text-to-speech failed:", error);
    return null;
  }
}
