type Input = { values: number[] };
type Output = number;

export const referenceSolution = (input: Input): Output => {
  return input.values.reduce((sum, value) => sum + value, 0);
};
