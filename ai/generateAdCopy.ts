import OpenAI from 'openai';

import { copywritingSystemPrompt } from './prompts';
import { ListingFieldInference } from './extractCarFields';

export interface GenerateAdCopyParams {
  listing: ListingFieldInference & {
    description?: string;
    title?: string;
  };
}

export interface GenerateAdCopyResult {
  title: string;
  description: string;
}

export class AdCopyGenerator {
  constructor(private readonly openai = new OpenAI()) {}

  async generate({ listing }: GenerateAdCopyParams): Promise<GenerateAdCopyResult> {
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.4,
      messages: [
        { role: 'system', content: copywritingSystemPrompt },
        {
          role: 'user',
          content: `Compose a car ad for the following structured data: ${JSON.stringify(listing)}`
        }
      ]
    });

    if (!response.choices?.length) {
      return {
        title: listing.title ?? 'Car for sale',
        description: listing.description ?? 'Well-maintained vehicle available.'
      };
    }
    const content = response.choices[0]?.message?.content ?? '';
    const [titleLine, ...rest] = content.split('\n').filter(Boolean);
    return {
      title: titleLine?.slice(0, 80) ?? 'Car for sale',
      description: rest.join('\n').trim()
    };
  }
}
