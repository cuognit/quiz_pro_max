import {
  collection,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  where,
  Timestamp
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';

export interface ReviewItem {
  id: string;
  authorName: string;
  rating: number;
  comment: string;
  quickTag: string;
  isPublic: boolean;
  createdAt: number;
}

const LOCAL_REVIEWS_CACHE_KEY = 'sqa_quiz_real_reviews_v2';

export const QUICK_REVIEW_TAGS = [
  'Đề chuẩn 100% ngân hàng',
  'Giao diện mượt & dễ nhìn',
  'Ôn thi SQA siêu hiệu quả',
  'Luyện câu sai rất tiện',
  'Chúc các bạn thi đạt A+'
];

function getCachedLocalReviews(): ReviewItem[] {
  if (typeof window === 'undefined') return [];
  try {
    // Clean up old v1 cache if present
    localStorage.removeItem('sqa_quiz_community_reviews_v1');
    const raw = localStorage.getItem(LOCAL_REVIEWS_CACHE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveCachedLocalReviews(items: ReviewItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_REVIEWS_CACHE_KEY, JSON.stringify(items.slice(0, 100)));
  } catch {
    // ignore storage quota errors
  }
}

function mergeAndSortReviews(remoteReviews: ReviewItem[], localReviews: ReviewItem[]): ReviewItem[] {
  const map = new Map<string, ReviewItem>();

  for (const item of localReviews) {
    map.set(item.id, item);
  }
  for (const item of remoteReviews) {
    map.set(item.id, item);
  }

  return Array.from(map.values()).sort((a, b) => b.createdAt - a.createdAt);
}

export function subscribeToCommunityReviews(
  onUpdate: (reviews: ReviewItem[]) => void
): () => void {
  const initialLocal = getCachedLocalReviews();
  onUpdate(mergeAndSortReviews([], initialLocal));

  const reviewsPath = 'reviews';
  const q = query(collection(db, reviewsPath), where('isPublic', '==', true));

  const unsubscribe = onSnapshot(
    q,
    snapshot => {
      const remoteItems: ReviewItem[] = [];
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        let createdAtMs = Date.now();
        if (data.createdAt instanceof Timestamp) {
          createdAtMs = data.createdAt.toMillis();
        } else if (typeof data.createdAt === 'number') {
          createdAtMs = data.createdAt;
        }

        if (
          typeof data.authorName === 'string' &&
          typeof data.rating === 'number' &&
          typeof data.comment === 'string'
        ) {
          remoteItems.push({
            id: docSnap.id,
            authorName: data.authorName,
            rating: Math.min(5, Math.max(1, Math.round(data.rating))),
            comment: data.comment,
            quickTag: typeof data.quickTag === 'string' ? data.quickTag : QUICK_REVIEW_TAGS[0],
            isPublic: true,
            createdAt: createdAtMs
          });
        }
      });

      saveCachedLocalReviews(remoteItems);
      onUpdate(remoteItems.sort((a, b) => b.createdAt - a.createdAt));
    },
    error => {
      try {
        handleFirestoreError(error, OperationType.LIST, reviewsPath);
      } catch {
        onUpdate(getCachedLocalReviews().sort((a, b) => b.createdAt - a.createdAt));
      }
    }
  );

  return unsubscribe;
}

export interface SubmitReviewInput {
  authorName: string;
  rating: number;
  comment: string;
  quickTag: string;
}

export async function submitCommunityReview(input: SubmitReviewInput): Promise<ReviewItem> {
  const sanitizedAuthor = (input.authorName.trim() || 'Sĩ tử SQA').slice(0, 40);
  const sanitizedRating = Math.min(5, Math.max(1, Math.round(Number(input.rating) || 5)));
  const sanitizedComment = input.comment.trim().slice(0, 400);
  const sanitizedTag = (input.quickTag.trim() || QUICK_REVIEW_TAGS[0]).slice(0, 50);

  if (!sanitizedComment) {
    throw new Error('Vui lòng nhập nội dung đánh giá hoặc lời chúc.');
  }

  const reviewId = `rev_${Date.now()}_${Math.random().toString(36).replace(/[^a-zA-Z0-9]/g, '').slice(0, 8)}`;
  const nowMs = Date.now();

  const optimisticItem: ReviewItem = {
    id: reviewId,
    authorName: sanitizedAuthor,
    rating: sanitizedRating,
    comment: sanitizedComment,
    quickTag: sanitizedTag,
    isPublic: true,
    createdAt: nowMs
  };

  const existingLocal = getCachedLocalReviews();
  saveCachedLocalReviews([optimisticItem, ...existingLocal]);

  const docPath = `reviews/${reviewId}`;
  try {
    await setDoc(doc(db, 'reviews', reviewId), {
      authorName: sanitizedAuthor,
      rating: sanitizedRating,
      comment: sanitizedComment,
      quickTag: sanitizedTag,
      isPublic: true,
      createdAt: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, docPath);
  }

  return optimisticItem;
}
