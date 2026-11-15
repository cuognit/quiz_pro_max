import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Question } from '../types/quiz';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const questionsPath = path.resolve(__dirname, '../data/questions.json');
const publicDir = path.resolve(__dirname, '../../public');

const questions: Question[] = JSON.parse(fs.readFileSync(questionsPath, 'utf8'));

test('questions.json has expected total question volume (> 250 items)', () => {
  assert.ok(questions.length >= 250, `Expected at least 250 questions, received ${questions.length}`);
  assert.equal(questions.length, 299, 'Total questions count should be exactly 299');
});

test('every question has valid schema, required fields, and unique IDs', () => {
  const seenIds = new Set<string>();
  const validDifficulties = new Set(['DỄ', 'TRUNG BÌNH', 'KHÓ']);
  const validCdrs = new Set(['CĐR 1.1', 'CĐR 2.1']);

  for (let idx = 0; idx < questions.length; idx++) {
    const q = questions[idx];
    const prefix = `Question [${idx}] (${q.id || 'NO_ID'})`;

    // ID validation
    assert.ok(q.id && typeof q.id === 'string', `${prefix}: must have valid string id`);
    assert.ok(!seenIds.has(q.id), `${prefix}: Duplicate ID found ${q.id}`);
    seenIds.add(q.id);

    // Code & Content
    assert.ok(q.code && typeof q.code === 'string', `${prefix}: must have code`);
    assert.ok(q.question && typeof q.question === 'string' && q.question.trim().length > 0, `${prefix}: must have non-empty question text`);

    // Group validation (1 to 6)
    assert.ok(typeof q.group === 'number' && q.group >= 1 && q.group <= 6, `${prefix}: group must be between 1 and 6, got ${q.group}`);
    assert.ok(q.groupName && typeof q.groupName === 'string', `${prefix}: groupName must exist`);

    // CDR validation
    assert.ok(validCdrs.has(q.cdr), `${prefix}: CDR must be CĐR 1.1 or CĐR 2.1, got ${q.cdr}`);

    // Difficulty validation
    assert.ok(validDifficulties.has(q.difficulty), `${prefix}: difficulty invalid, got ${q.difficulty}`);

    // Options validation: exactly 4 options
    assert.ok(Array.isArray(q.options), `${prefix}: options must be array`);
    assert.equal(q.options.length, 4, `${prefix}: must have exactly 4 options, got ${q.options.length}`);

    // Option structure
    const labels = ['A', 'B', 'C', 'D'];
    q.options.forEach((opt, optIdx) => {
      assert.equal(opt.id, optIdx + 1, `${prefix}: Option #${optIdx + 1} id must be ${optIdx + 1}`);
      assert.equal(opt.label, labels[optIdx], `${prefix}: Option #${optIdx + 1} label must be ${labels[optIdx]}`);
      assert.ok(typeof opt.text === 'string' && opt.text.trim().length > 0, `${prefix}: Option ${labels[optIdx]} has empty text`);
    });

    // Correct option validation
    assert.ok(typeof q.correctOption === 'number', `${prefix}: correctOption must be a number`);
    assert.ok(q.correctOption >= 1 && q.correctOption <= 4, `${prefix}: correctOption must be 1..4, got ${q.correctOption}`);

    // Diagram validation
    if (q.diagramUrl) {
      assert.ok(typeof q.diagramUrl === 'string' && q.diagramUrl.startsWith('/diagrams/'), `${prefix}: diagramUrl must start with /diagrams/`);
      const fullImgPath = path.join(publicDir, q.diagramUrl);
      assert.ok(fs.existsSync(fullImgPath), `${prefix}: referenced diagram file does not exist at ${fullImgPath}`);
    }
  }
});

test('questions distribution matches syllabus requirements across 6 groups', () => {
  const groupCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
  for (const q of questions) {
    groupCounts[q.group] = (groupCounts[q.group] || 0) + 1;
  }

  // Ensure each group has enough questions for standard exam blueprints
  // Standard exam requirements: Group 1: 8, Group 2: 12, Group 3: 5, Group 4: 5, Group 5: 12, Group 6: 8
  assert.ok(groupCounts[1] >= 8, `Group 1 must have at least 8 questions, got ${groupCounts[1]}`);
  assert.ok(groupCounts[2] >= 12, `Group 2 must have at least 12 questions, got ${groupCounts[2]}`);
  assert.ok(groupCounts[3] >= 5, `Group 3 must have at least 5 questions, got ${groupCounts[3]}`);
  assert.ok(groupCounts[4] >= 5, `Group 4 must have at least 5 questions, got ${groupCounts[4]}`);
  assert.ok(groupCounts[5] >= 12, `Group 5 must have at least 12 questions, got ${groupCounts[5]}`);
  assert.ok(groupCounts[6] >= 8, `Group 6 must have at least 8 questions, got ${groupCounts[6]}`);
});
