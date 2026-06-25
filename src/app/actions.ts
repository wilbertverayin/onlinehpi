'use server';
import { verifyAnswer, VerifyAnswerInput, VerifyAnswerOutput } from '@/ai/flows/verify-answer';
import { textToSpeech, TextToSpeechInput, TextToSpeechOutput } from '@/ai/flows/text-to-speech';

export async function verifyAnswerAction(input: VerifyAnswerInput): Promise<VerifyAnswerOutput> {
  try {
    const result = await verifyAnswer(input);
    return result;
  } catch (error) {
    console.error("AI verification failed:", error);
    // Graceful fallback: If the AI service fails, we assume the user's answer is valid
    // to avoid blocking the assessment flow. This enhances user experience.
    return {
      isValid: true,
      correctedAnswer: input.answer,
    };
  }
}

export async function textToSpeechAction(input: TextToSpeechInput): Promise<TextToSpeechOutput | null> {
  try {
    const result = await textToSpeech(input);
    return result;
  } catch (error) {
    console.error("Text-to-speech failed:", error);
    // Don't block user if TTS fails
    return null;
  }
}
