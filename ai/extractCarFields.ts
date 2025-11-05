import OpenAI from 'openai';
import { z } from 'zod';

import { extractionSystemPrompt, followUpSystemPrompt } from './prompts';

const listingFieldSchema = z.object({
  make: z.string().min(1).optional(),
  model: z.string().min(1).optional(),
  trim: z.string().optional(),
  year: z.coerce.number().int().optional(),
  mileageKm: z.coerce.number().int().optional(),
  bodyType: z.string().optional(),
  fuelType: z.string().optional(),
  transmission: z.string().optional(),
  drivetrain: z.string().optional(),
  color: z.string().optional(),
  doors: z.coerce.number().int().optional(),
  engineSizeL: z.coerce.number().optional(),
  powerHp: z.coerce.number().optional(),
  ownersCount: z.coerce.number().int().optional(),
  accidentHistory: z.string().optional(),
  serviceHistory: z.string().optional(),
  locationRegion: z.string().optional(),
  price: z.coerce.number().optional(),
  currency: z.string().optional(),
  vin: z.string().optional(),
  plateRedacted: z.boolean().optional(),
  notableFeatures: z.array(z.string()).optional()
});

export type ListingFieldInference = z.infer<typeof listingFieldSchema>;

export interface FieldInferenceResult {
  fields: ListingFieldInference;
  confidence: Record<keyof ListingFieldInference, number>;
  nextQuestion?: string;
  safetyFlags?: string[];
}

export interface ExtractCarFieldsParams {
  images: { url: string }[];
  partial: Partial<ListingFieldInference>;
  conversation?: { role: 'user' | 'assistant'; content: string }[];
}

const extractionFunction = {
  name: 'set_listing_fields',
  description: 'Populate structured car listing fields with confidence scores',
  parameters: {
    type: 'object',
    properties: {
      fields: {
        type: 'object',
        properties: {
          make: { type: 'string' },
          model: { type: 'string' },
          trim: { type: 'string' },
          year: { type: 'number' },
          mileageKm: { type: 'number' },
          bodyType: { type: 'string' },
          fuelType: { type: 'string' },
          transmission: { type: 'string' },
          drivetrain: { type: 'string' },
          color: { type: 'string' },
          doors: { type: 'number' },
          engineSizeL: { type: 'number' },
          powerHp: { type: 'number' },
          ownersCount: { type: 'number' },
          accidentHistory: { type: 'string' },
          serviceHistory: { type: 'string' },
          locationRegion: { type: 'string' },
          price: { type: 'number' },
          currency: { type: 'string' },
          vin: { type: 'string' },
          plateRedacted: { type: 'boolean' },
          notableFeatures: { type: 'array', items: { type: 'string' } }
        }
      },
      confidence: {
        type: 'object',
        additionalProperties: { type: 'number', minimum: 0, maximum: 1 }
      },
      safetyFlags: {
        type: 'array',
        items: { type: 'string' }
      }
    },
    required: ['fields', 'confidence']
  }
} as const;

export class CarFieldExtractor {
  constructor(private readonly openai = new OpenAI()) {}

  async infer({ images, partial, conversation = [] }: ExtractCarFieldsParams): Promise<FieldInferenceResult> {
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.2,
      messages: [
        { role: 'system', content: extractionSystemPrompt },
        ...images.map((image) => ({
          role: 'user' as const,
          content: [
            {
              type: 'input_text',
              text: `Analyse this car photo. Current known fields: ${JSON.stringify(partial)}`
            },
            {
              type: 'input_image',
              image_url: image.url
            }
          ]
        })),
        ...conversation
      ],
      functions: [extractionFunction],
      function_call: { name: 'set_listing_fields' }
    });


    if (!response.choices?.length) {
      throw new Error('Extraction failed - no choices');
    }
    const toolCall = response.choices[0].message.function_call;
    if (!toolCall?.arguments) {
      throw new Error('Extraction failed - missing tool call');
    }

    const parsed = JSON.parse(toolCall.arguments) as FieldInferenceResult;
    const fields = listingFieldSchema.partial().parse(parsed.fields);

    const confidence: FieldInferenceResult['confidence'] = parsed.confidence ?? {};

    const knownLowConfidenceKey = Object.entries(confidence)
      .filter(([, score]) => typeof score === 'number' && score < 0.7)
      .sort((a, b) => a[1] - b[1])[0]?.[0] as keyof ListingFieldInference | undefined;

    let nextQuestion: string | undefined;
    if (knownLowConfidenceKey) {
      const followUp = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        temperature: 0.4,
        messages: [
          { role: 'system', content: followUpSystemPrompt },
          {
            role: 'user',
            content: `Missing field: ${knownLowConfidenceKey}. Current fields: ${JSON.stringify(fields)}.`
          }
        ]
      });
      if (!followUp.choices?.length) {
        return {
          fields,
          confidence,
          nextQuestion: undefined,
          safetyFlags: parsed.safetyFlags
        };
      }
      nextQuestion = followUp.choices[0]?.message?.content ?? undefined;
    }

    return {
      fields,
      confidence,
      nextQuestion,
      safetyFlags: parsed.safetyFlags
    };
  }
}
