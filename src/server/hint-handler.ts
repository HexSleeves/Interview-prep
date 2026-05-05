import Anthropic from "@anthropic-ai/sdk";

export const SOCRATIC_SYSTEM_PROMPT = `You are a Socratic coding coach. Your only job is to help the learner discover the answer themselves.

Hard rules:
- Ask exactly one question per response. Never more.
- Never give code, pseudocode, or algorithm names the learner has not already used.
- Never state the answer or the fix directly.
- Point at the smallest suspicious assumption in the learner's code.
- Prefer questions about invariants, edge cases, and trace reasoning.
- If the learner is on the right track, ask them to verify their reasoning on the failing case.
- Your response is a single question only. No preamble, no summary.`;

export type ProblemContext = {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  tags: string[];
};

export type HintRequest = {
  problem: ProblemContext;
  userCode: string;
  testResult: { passed: boolean | number; total: number };
  failingCase: { input: unknown; expected: unknown; received: unknown } | null;
  previousHints: string[];
};

type Message = { role: "user" | "assistant"; content: string };

export function buildHintMessages(req: HintRequest): Message[] {
  const messages: Message[] = [];

  // Interleave previous hints as assistant turns with placeholder user turns
  for (const hint of req.previousHints) {
    messages.push({
      role: "user",
      content: "Please give me a hint.",
    });
    messages.push({ role: "assistant", content: hint });
  }

  // Build the current user message
  const failingSection = req.failingCase
    ? `\nFailing test case:\n  Input: ${JSON.stringify(req.failingCase.input)}\n  Expected: ${JSON.stringify(req.failingCase.expected)}\n  Received: ${JSON.stringify(req.failingCase.received)}`
    : "\nNo failing case — all tests passed (or none run yet).";

  const userContent = `Problem: ${req.problem.title} (${req.problem.difficulty})
Domain: ${req.problem.tags.join(", ")}
Description: ${req.problem.description}

Test result: ${JSON.stringify(req.testResult)}${failingSection}

My current code:
\`\`\`typescript
${req.userCode}
\`\`\`

Ask me one Socratic question about what might be wrong.`;

  messages.push({ role: "user", content: userContent });
  return messages;
}

const HINT_TIMEOUT_MS = 4000;
const FALLBACK_HINT = "Coach is unavailable — try again in a moment.";

export async function getHint(req: HintRequest): Promise<string> {
  const apiKey = process.env["ANTHROPIC_API_KEY"];
  if (!apiKey) return FALLBACK_HINT;

  const client = new Anthropic({ apiKey });
  const messages = buildHintMessages(req);

  try {
    const result = await Promise.race([
      client.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 256,
        system: SOCRATIC_SYSTEM_PROMPT,
        messages,
      }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("hint timeout")), HINT_TIMEOUT_MS),
      ),
    ]);

    const block = result.content[0];
    if (block?.type === "text") return block.text;
    return FALLBACK_HINT;
  } catch {
    return FALLBACK_HINT;
  }
}
