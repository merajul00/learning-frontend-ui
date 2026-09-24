interface MistakeLike {
  japanese: string;
  romaji: string | null;
  banglaPronunciation: string | null;
  correctOption: string;
}

function normalize(value: string | null): string {
  return (value ?? '').trim().toLowerCase();
}

/** Infers which field was tested by matching the trusted correct value against the item's columns. */
export function explainMistake(item: MistakeLike): string {
  const correct = normalize(item.correctOption);

  if (correct === normalize(item.romaji)) {
    return `${item.japanese} is read as "${item.romaji}".`;
  }
  if (correct === normalize(item.japanese)) {
    return `"${item.correctOption}" is written as ${item.japanese}.`;
  }
  if (correct === normalize(item.banglaPronunciation)) {
    return `${item.japanese} sounds like "${item.banglaPronunciation}" in Bangla.`;
  }
  return `The correct answer is "${item.correctOption}".`;
}
