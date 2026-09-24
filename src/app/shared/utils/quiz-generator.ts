import { LearningItem } from '../../core/models/learning-item.model';
import { QuestionField, QuizQuestion } from '../../core/models/quiz.model';

/** Maps a question field to its trusted learning_items column, for RPC scoring. */
export const FIELD_TO_DB_COLUMN: Record<QuestionField, string> = {
  japanese: 'japanese',
  romaji: 'romaji',
  banglaPronunciation: 'bangla_pronunciation',
};

interface QuestionType {
  promptField: QuestionField;
  answerField: QuestionField;
}

const QUESTION_TYPES: QuestionType[] = [
  { promptField: 'japanese', answerField: 'banglaPronunciation' },
  { promptField: 'banglaPronunciation', answerField: 'japanese' },
];

function fieldValue(item: LearningItem, field: QuestionField): string | null {
  return item[field];
}

function explanationFor(item: LearningItem, type: QuestionType): string {
  if (type.answerField === 'japanese') {
    return `"${item.banglaPronunciation}" is written as ${item.japanese}.`;
  }
  return `${item.japanese} sounds like "${item.banglaPronunciation}" in Bangla.`;
}

function shuffle<T>(values: T[]): T[] {
  const copy = [...values];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function buildQuestion(item: LearningItem, type: QuestionType, pool: LearningItem[]): QuizQuestion | null {
  const prompt = fieldValue(item, type.promptField);
  const correctAnswer = fieldValue(item, type.answerField);
  if (!prompt || !correctAnswer) return null;

  const seenValues = new Set([normalize(correctAnswer)]);
  const distractorPool = shuffle(
    pool.filter((candidate) => candidate.id !== item.id),
  );

  const distractors: string[] = [];
  for (const candidate of distractorPool) {
    if (distractors.length >= 3) break;
    const value = fieldValue(candidate, type.answerField);
    if (!value) continue;
    const key = normalize(value);
    if (seenValues.has(key)) continue;
    seenValues.add(key);
    distractors.push(value);
  }

  if (distractors.length === 0) return null;

  return {
    learningItemId: item.id,
    promptField: type.promptField,
    answerField: type.answerField,
    prompt,
    options: shuffle([correctAnswer, ...distractors]),
    correctAnswer,
    explanation: explanationFor(item, type),
  };
}

function viableQuestionTypes(items: LearningItem[]): QuestionType[] {
  return QUESTION_TYPES.filter((type) => {
    const withField = items.filter(
      (item) => fieldValue(item, type.promptField) && fieldValue(item, type.answerField),
    );
    return withField.length >= 2;
  });
}

/**
 * Random Quiz Logic: pick a target item, generate up to 3 shuffled incorrect
 * options from the same answer pool, and avoid duplicate/back-to-back questions
 * when enough unique items exist.
 */
export function generateQuestions(
  items: LearningItem[],
  count: number,
  options?: { restrictToItemIds?: string[] },
): QuizQuestion[] {
  const types = viableQuestionTypes(items);
  if (types.length === 0 || items.length === 0) return [];

  const targetPool = options?.restrictToItemIds?.length
    ? items.filter((item) => options.restrictToItemIds!.includes(item.id))
    : items;
  if (targetPool.length === 0) return [];

  const questions: QuizQuestion[] = [];
  let cursor = shuffle(targetPool);
  let cursorIndex = 0;
  let lastItemId: string | null = null;
  let guard = 0;

  while (questions.length < count && guard < count * 20) {
    guard++;

    if (cursorIndex >= cursor.length) {
      cursor = shuffle(targetPool);
      cursorIndex = 0;
    }

    const item = cursor[cursorIndex++];
    if (item.id === lastItemId && targetPool.length > 1) continue;

    const type = types[Math.floor(Math.random() * types.length)];
    const question = buildQuestion(item, type, items);
    if (!question) continue;

    questions.push(question);
    lastItemId = item.id;
  }

  return questions;
}
