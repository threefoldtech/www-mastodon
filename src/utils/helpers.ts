const NUMBERS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
const ALPHA = [
  ...Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i)),
  ...Array.from({ length: 26 }, (_, i) => String.fromCharCode(97 + i)),
];
const ALL = [...NUMBERS, ...ALPHA];

export function generateString(
  length: number = 10,
  prefix: string = getRandomValue(ALPHA)
): string {
  length = length - prefix.length;
  for (let i = 0; i < length; i++) prefix += getRandomValue(ALL);
  return prefix;
}

export function getRandomValue<T>(list: T[]): T {
  return list[Math.floor(Math.random() * list.length)];
}
