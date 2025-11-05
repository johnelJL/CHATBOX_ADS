import { describe, expect, it } from 'vitest';

import { copywritingSystemPrompt, extractionSystemPrompt } from '@/ai/prompts';

describe('AI prompts', () => {
  it('contain non-empty strings', () => {
    expect(extractionSystemPrompt.length).toBeGreaterThan(10);
    expect(copywritingSystemPrompt.length).toBeGreaterThan(10);
  });
});
