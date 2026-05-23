// /api/scan.js
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic(); // reads ANTHROPIC_API_KEY from the environment

const MODEL = 'claude-sonnet-4-6';
const PROMPT_VERSION = 'v1';

const EXTRACTION_PROMPT = `You are extracting structured data from a photo of a specialty coffee bag.

Extract ONLY information clearly visible and printed on the bag. Follow these rules strictly:
- If a field is not visible or not printed, return null for it. Do NOT guess, infer, or fill in plausible values.
- Do not use any outside knowledge about the roaster or coffee. Report only what the bag itself shows.
- For tasting notes, return exactly the words printed on the bag, as an array of strings. If none are printed, return an empty array.

Respond with ONLY a valid JSON object — no explanation, no markdown, no code fences — with exactly these keys:

{
  "roaster_name": string or null,
  "coffee_name": string or null,
  "origin_country": string or null,
  "origin_region": string or null,
  "producer": string or null,
  "farm": string or null,
  "variety": string or null,
  "elevation": string or null,
  "processing_method": "washed" | "natural" | "honey" | "anaerobic" | "other" | null,
  "process_detail": string or null,
  "roast_level": "light" | "medium-light" | "medium" | "medium-dark" | "dark" | null,
  "roast_date": string or null,
  "weight": string or null,
  "price": string or null,
  "tasting_notes": array of strings
}`;

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Use POST.' });
      }
    
    const { imageUrl } = req.body || {};
    if (!imageUrl) {
        return res.status(400).json({ error: 'Missing imageUrl in request body.' });
      }

  try {
    const message = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'image', source: { type: 'url', url: imageUrl } },
            { type: 'text', text: EXTRACTION_PROMPT },
          ],
        },
      ],
    });

    const rawText = message.content[0]?.type === 'text' ? message.content[0].text : '';

    let extracted;
    try {
      extracted = JSON.parse(rawText.replace(/```json|```/g, '').trim());
    } catch {
      // Claude returned something that wasn't clean JSON — surface it so we can see why
      return res.status(200).json({ parseError: true, rawText });
    }

    return res.status(200).json({ model: MODEL, promptVersion: PROMPT_VERSION, extracted });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}