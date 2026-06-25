// AI features disabled for static build
import { VerifyAnswerInput, VerifyAnswerOutput, verifyAnswer } from '@/ai/flows/verify-answer';
import { TextToSpeechInput, TextToSpeechOutput, textToSpeech } from '@/ai/flows/text-to-speech';

export async function verifyAnswerAction(input: VerifyAnswerInput): Promise<VerifyAnswerOutput> {
  try {
    const result = await verifyAnswer(input);
    return result;
  } catch (error) {
    console.error("AI verification failed:", error);
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
    return null;
  }
}
