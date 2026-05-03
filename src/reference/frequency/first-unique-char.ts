type Input = { s: string };
type Output = number;

export const referenceSolution = (input: Input): Output => {
  const { s } = input;
  const freqMap = new Map<string, number>();

  for (const char of s) {
    freqMap.set(char, (freqMap.get(char) ?? 0) + 1);
  }

  for (let i = 0; i < s.length; i++) {
    if (freqMap.get(s[i]!) === 1) {
      return i;
    }
  }

  return -1;
};
