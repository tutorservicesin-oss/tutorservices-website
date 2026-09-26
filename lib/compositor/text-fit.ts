export type WrappedLine = {
  text: string;
  width: number;
};

export type TextFitResult = {
  fontSize: number;
  lineHeight: number;
  lines: WrappedLine[];
  fits: boolean;
};

export type MeasureText = (text: string, fontSize: number, fontWeight: string) => number;

export const approximateMeasureText: MeasureText = (text, fontSize) => {
  const wideChars = (text.match(/[MW@#%&]/g) ?? []).length;
  const narrowChars = (text.match(/[il.,' ]/g) ?? []).length;
  const normalChars = Math.max(text.length - wideChars - narrowChars, 0);

  return fontSize * (wideChars * 0.78 + normalChars * 0.56 + narrowChars * 0.28);
};

export function wrapText(
  text: string,
  fontSize: number,
  maxWidth: number,
  fontWeight: string,
  measure: MeasureText = approximateMeasureText,
): WrappedLine[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: WrappedLine[] = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    const candidateWidth = measure(candidate, fontSize, fontWeight);

    if (candidateWidth <= maxWidth || !current) {
      current = candidate;
      continue;
    }

    lines.push({ text: current, width: measure(current, fontSize, fontWeight) });
    current = word;
  }

  if (current) {
    lines.push({ text: current, width: measure(current, fontSize, fontWeight) });
  }

  return lines;
}

export function fitTextToBox(options: {
  text: string;
  maxWidth: number;
  maxHeight: number;
  maxFontSize: number;
  minFontSize: number;
  fontWeight: string;
  measure?: MeasureText;
}): TextFitResult {
  const measure = options.measure ?? approximateMeasureText;

  for (let size = options.maxFontSize; size >= options.minFontSize; size -= 1) {
    const lineHeight = Math.round(size * 1.12);
    const lines = wrapText(options.text, size, options.maxWidth, options.fontWeight, measure);
    const tallestWord = Math.max(...options.text.split(/\s+/).map((word) => measure(word, size, options.fontWeight)), 0);
    const fits = lines.length * lineHeight <= options.maxHeight && tallestWord <= options.maxWidth;

    if (fits) {
      return { fontSize: size, lineHeight, lines, fits: true };
    }
  }

  const lineHeight = Math.round(options.minFontSize * 1.12);
  return {
    fontSize: options.minFontSize,
    lineHeight,
    lines: wrapText(options.text, options.minFontSize, options.maxWidth, options.fontWeight, measure),
    fits: false,
  };
}
