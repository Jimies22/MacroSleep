'use server';
/**
 * @fileOverview A flow to get nutritional information for a given food item.
 *
 * - getFoodInfo - A function that fetches macro nutritional data.
 * - GetFoodInfoInput - The input type for the getFoodInfo function.
 * - GetFoodInfoOutput - The return type for the getFoodInfo function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GetFoodInfoInputSchema = z.object({
  foodName: z.string().describe('The name of the food item to look up.'),
});
export type GetFoodInfoInput = z.infer<typeof GetFoodInfoInputSchema>;

const GetFoodInfoOutputSchema = z.object({
  calories: z.number().describe('The number of calories in the food.'),
  protein: z.number().describe('The amount of protein in grams.'),
  carbs: z.number().describe('The amount of carbohydrates in grams.'),
  fats: z.number().describe('The amount of fat in grams.'),
});
export type GetFoodInfoOutput = z.infer<typeof GetFoodInfoOutputSchema>;

export async function getFoodInfo(
  input: GetFoodInfoInput
): Promise<GetFoodInfoOutput> {
  return getFoodInfoFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getFoodInfoPrompt',
  input: {schema: GetFoodInfoInputSchema},
  output: {schema: GetFoodInfoOutputSchema},
  prompt: `You are a nutritional expert. Provide the typical nutritional information for a standard serving of the following food item: {{{foodName}}}. 
  
  Return the data in the specified JSON format, providing only numerical values for calories, protein, carbs, and fats.`,
});

const getFoodInfoFlow = ai.defineFlow(
  {
    name: 'getFoodInfoFlow',
    inputSchema: GetFoodInfoInputSchema,
    outputSchema: GetFoodInfoOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
