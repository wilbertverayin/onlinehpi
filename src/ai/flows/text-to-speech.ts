// AI features disabled for static build

/**
 * @fileOverview Converts text to speech.
 * - textToSpeech - A function that converts text to an audio data URI.
 * - TextToSpeechInput - The input type for the textToSpeech function.
 * - TextToSpeechOutput - The return type for the textToSpeech function.
 */

export type TextToSpeechInput = string;

export type TextToSpeechOutput = {
  audioDataUri: string;
};

export async function textToSpeech(_input: TextToSpeechInput): Promise<TextToSpeechOutput> {
  return { audioDataUri: '' };
}
