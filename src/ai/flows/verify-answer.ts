'use server';

/**
 * @fileOverview Verifies user answers to ensure they are factual, clear, and objective.
 *
 * - verifyAnswer - A function that verifies the user's answer.
 * - VerifyAnswerInput - The input type for the verifyAnswer function.
 * - VerifyAnswerOutput - The return type for the verifyAnswer function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const VerifyAnswerInputSchema = z.object({
  question: z.string().describe('The question that was asked.'),
  answer: z.string().describe('The user provided answer to the question.'),
});
export type VerifyAnswerInput = z.infer<typeof VerifyAnswerInputSchema>;

const VerifyAnswerOutputSchema = z.object({
  isValid: z.boolean().describe('Whether the answer is valid or not.'),
  correctedAnswer: z.string().describe('The corrected answer, if the original answer was invalid.'),
});
export type VerifyAnswerOutput = z.infer<typeof VerifyAnswerOutputSchema>;

export async function verifyAnswer(input: VerifyAnswerInput): Promise<VerifyAnswerOutput> {
  return verifyAnswerFlow(input);
}

const verifyAnswerPrompt = ai.definePrompt({
  name: 'verifyAnswerPrompt',
  input: {schema: VerifyAnswerInputSchema},
  output: {schema: VerifyAnswerOutputSchema},
  prompt: `You are an AI assistant that verifies user answers to questions, especially in the context of medical questionnaires. Your goal is to ensure that the answers are factual, clear, and objective. The conversation is in Filipino/Tagalog.

  Here's the question and the user's answer:

  Question: {{{question}}}
  Answer: {{{answer}}}

  1.  Determine if the user's answer is a valid and reasonable response to the question.
  2.  If the answer is valid, return \`isValid\` as true. Then, rephrase the answer to be slightly more formal or clear if necessary and return it in \`correctedAnswer\`. If no changes are needed, \`correctedAnswer\` should be the same as the original answer. The \`correctedAnswer\` MUST be in Filipino/Tagalog.
  3.  If the answer is invalid (e.g., nonsensical, a joke, completely irrelevant, or too vague to be useful), return \`isValid\` as false. The \`correctedAnswer\` can be an empty string.
`,
});

const verifyAnswerFlow = ai.defineFlow(
  {
    name: 'verifyAnswerFlow',
    inputSchema: VerifyAnswerInputSchema,
    outputSchema: VerifyAnswerOutputSchema,
  },
  async input => {
    const {output} = await verifyAnswerPrompt(input);
    return output!;
  }
);
