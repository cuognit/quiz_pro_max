import test from 'node:test';
import assert from 'node:assert/strict';
import {
  QUICK_REVIEW_TAGS,
  getCurrentReviewerId,
  getMyReviewIds,
  isMyReview,
  ReviewItem
} from './reviewsService';

// Mock localStorage for Node test environment
class LocalStorageMock {
  private store: Record<string, string> = {};
  getItem(key: string): string | null {
    return this.store[key] ?? null;
  }
  setItem(key: string, value: string): void {
    this.store[key] = String(value);
  }
  removeItem(key: string): void {
    delete this.store[key];
  }
  clear(): void {
    this.store = {};
  }
}

(globalThis as any).localStorage = new LocalStorageMock();
(globalThis as any).window = {};

test('QUICK_REVIEW_TAGS provides expected default review presets', () => {
  assert.ok(Array.isArray(QUICK_REVIEW_TAGS));
  assert.ok(QUICK_REVIEW_TAGS.length >= 5);
  assert.ok(QUICK_REVIEW_TAGS.includes('Đề chuẩn 100% ngân hàng'));
  assert.ok(QUICK_REVIEW_TAGS.includes('Giao diện mượt & dễ nhìn'));
  assert.ok(QUICK_REVIEW_TAGS.includes('Chúc các bạn thi đạt A+'));
});

test('getCurrentReviewerId generates and persists a valid unique user id', () => {
  const uid1 = getCurrentReviewerId();
  assert.ok(typeof uid1 === 'string' && uid1.startsWith('usr_'));
  const uid2 = getCurrentReviewerId();
  assert.equal(uid1, uid2);
});

test('isMyReview correctly identifies review ownership', () => {
  const myUid = getCurrentReviewerId();
  const myReview: ReviewItem = {
    id: 'rev_mine_1',
    authorName: 'Sĩ tử SQA',
    rating: 5,
    comment: 'Tuyệt vời',
    quickTag: QUICK_REVIEW_TAGS[0],
    isPublic: true,
    authorId: myUid,
    createdAt: Date.now()
  };

  const otherReview: ReviewItem = {
    id: 'rev_other_1',
    authorName: 'Người khác',
    rating: 4,
    comment: 'Tốt',
    quickTag: QUICK_REVIEW_TAGS[1],
    isPublic: true,
    authorId: 'usr_different_user',
    createdAt: Date.now()
  };

  assert.equal(isMyReview(myReview), true);
  assert.equal(isMyReview(otherReview), false);
});
