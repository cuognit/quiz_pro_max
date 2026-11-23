import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Question } from '../types/quiz';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const questionsPath = path.resolve(__dirname, '../data/questions.json');

const questions: Question[] = JSON.parse(fs.readFileSync(questionsPath, 'utf8'));

test('questions.json has exactly 319 Big Data questions', () => {
  assert.equal(questions.length, 319, `Total questions count should be exactly 319, got ${questions.length}`);
});

test('every question has valid Big Data schema, clean text, 4 sorted options, and valid answers', () => {
  const seenIds = new Set<string>();
  const validDifficulties = new Set(['DỄ', 'TRUNG BÌNH', 'KHÓ']);
  const validCdrs = new Set(['CĐR 1.1', 'CĐR 2.1', 'CĐR 3.1', 'Thực hành']);

  let multiSelectCount = 0;
  let discussionCount = 0;

  for (let idx = 0; idx < questions.length; idx++) {
    const q = questions[idx];
    const prefix = `Question [${idx}] (${q.id || 'NO_ID'})`;

    // ID validation
    assert.ok(q.id && typeof q.id === 'string', `${prefix}: must have valid string id`);
    assert.ok(!seenIds.has(q.id), `${prefix}: Duplicate ID found ${q.id}`);
    seenIds.add(q.id);

    // Code & Clean Content
    assert.ok(q.code && typeof q.code === 'string', `${prefix}: must have code`);
    assert.ok(q.question && typeof q.question === 'string' && q.question.trim().length > 0, `${prefix}: must have non-empty question text`);
    assert.ok(!q.question.includes('Note sai:'), `${prefix}: should have cleaned "Note sai:"`);
    assert.ok(!q.question.includes('FIX THIS'), `${prefix}: should have cleaned "FIX THIS"`);
    assert.ok(!q.question.includes('VAlene'), `${prefix}: should have cleaned "VAlene"`);

    // Group validation (1 to 5 for 5 Batches)
    assert.ok(typeof q.group === 'number' && q.group >= 1 && q.group <= 5, `${prefix}: group must be between 1 and 5, got ${q.group}`);
    assert.ok(q.groupName && typeof q.groupName === 'string', `${prefix}: groupName must exist`);

    // CDR & Difficulty validation
    assert.ok(validCdrs.has(q.cdr), `${prefix}: CDR invalid, got ${q.cdr}`);
    assert.ok(validDifficulties.has(q.difficulty), `${prefix}: difficulty invalid, got ${q.difficulty}`);

    // Options validation: exactly 4 options ordered A, B, C, D
    assert.ok(Array.isArray(q.options), `${prefix}: options must be array`);
    assert.equal(q.options.length, 4, `${prefix}: must have exactly 4 options, got ${q.options.length}`);

    const labels = ['A', 'B', 'C', 'D'];
    const optionTexts = new Set<string>();
    q.options.forEach((opt, optIdx) => {
      assert.equal(opt.id, optIdx + 1, `${prefix}: Option #${optIdx + 1} id must be ${optIdx + 1}`);
      assert.equal(opt.label, labels[optIdx], `${prefix}: Option #${optIdx + 1} label must be ${labels[optIdx]}`);
      assert.ok(typeof opt.text === 'string' && opt.text.trim().length > 0, `${prefix}: Option ${labels[optIdx]} has empty text`);
      optionTexts.add(opt.text.trim());
    });
    assert.equal(optionTexts.size, 4, `${prefix}: all 4 options must be distinct (guards against truncated multi-line options)`);

    // Answer validation
    if (q.isDiscussion) {
      discussionCount++;
      assert.equal(q.correctOption, 0, `${prefix}: discussion question must have correctOption 0`);
      assert.deepEqual(q.correctOptions, [], `${prefix}: discussion question must have empty correctOptions`);
    } else {
      assert.ok(Array.isArray(q.correctOptions) && q.correctOptions.length >= 1, `${prefix}: must have at least 1 correctOption`);
      for (const c of q.correctOptions!) {
        assert.ok(c >= 1 && c <= 4, `${prefix}: correctOption ${c} out of range 1..4`);
      }
      assert.equal(q.correctOption, q.correctOptions![0], `${prefix}: correctOption must equal first entry of correctOptions`);
      if (q.isMultiSelect) {
        multiSelectCount++;
        assert.ok(q.correctOptions!.length > 1, `${prefix}: isMultiSelect must have > 1 correct options`);
      }
    }
  }

  assert.equal(discussionCount, 2, 'Should have exactly 2 discussion questions (2-48 and 2-52)');
  assert.equal(multiSelectCount, 23, 'Should have exactly 23 multi-select questions');
});

test('questions distribution matches the 5 Big Data batches exactly', () => {
  const batchCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const q of questions) {
    batchCounts[q.group] = (batchCounts[q.group] || 0) + 1;
  }

  assert.equal(batchCounts[1], 46, 'Batch 1 should have 46 questions');
  assert.equal(batchCounts[2], 52, 'Batch 2 should have 52 questions');
  assert.equal(batchCounts[3], 45, 'Batch 3 should have 45 questions');
  assert.equal(batchCounts[4], 60, 'Batch 4 should have 60 questions');
  assert.equal(batchCounts[5], 116, 'Batch 5 should have 116 questions');
});
