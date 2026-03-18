import type z from 'zod';
import { useState } from 'react';
import { flattenZodErrors, type FieldErrors } from '@/utils/zodHelpers';

export function useZodFormValidation() {
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  function validate<T>(schema: z.ZodType<T>, data: unknown): { success: true; data: T } | { success: false } {
    setFieldErrors({});
    const result = schema.safeParse(data);
    if (!result.success) {
      setFieldErrors(flattenZodErrors(result.error));
      return { success: false };
    }
    return { success: true, data: result.data };
  }

  return { fieldErrors, validate };
}
