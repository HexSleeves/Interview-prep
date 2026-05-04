type Input = { s: string };
type Output = number;

export const solution = (input: Input): Output => {
  const freq: Record<string, number> = {};
  for (let i = 0; i < input.s.length; i++) {
    const char = input.s[i]!;
    freq[char] = (freq[char] ?? 0) + 1;
  }

  for (let i = 0; i < input.s.length; i++) {
    const char = input.s[i]!;
    if (freq[char] === 1) return i;
  }

  return -1;
};
