import { z } from 'zod';

export type FieldErrors = Record<string, string>;

export function flattenZodErrors(error: z.ZodError): FieldErrors {
  const flattened = z.flattenError(error);
  const result: FieldErrors = {};
  const fieldErrors = flattened.fieldErrors as Record<string, string[] | undefined>;
  for (const [key, messages] of Object.entries(fieldErrors)) {
    if (messages && messages.length > 0) {
      result[key] = messages[0];
    }
  }
  return result;
}
