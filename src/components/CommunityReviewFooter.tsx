import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Award,
  ChevronDown,
  ChevronUp,
  PenLine,
  Send,
  Star,
  Trash2,
  Users,
  X
} from 'lucide-react';
import {
  ReviewItem,
  subscribeToCommunityReviews,
  deleteCommunityReview,
  submitCommunityReview,
  QUICK_REVIEW_TAGS,
  isMyReview
} from '../utils/reviewsService';

interface CommunityReviewFooterProps {
  totalQuestionsCount: number;
}

function formatRelativeTime(timestampMs: number): string {
  const diffSec = Math.max(1, Math.floor((Date.now() - timestampMs) / 1000));
  if (diffSec < 60) return 'Vừa xong';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} phút trước`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours} giờ trước`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays} ngày trước`;
  return new Date(timestampMs).toLocaleDateString('vi-VN');
}

export const CommunityReviewFooter: React.FC<CommunityReviewFooterProps> = ({
  totalQuestionsCount
}) => {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 5 | 4 | 'low'>('all');
  const [visibleCount, setVisibleCount] = useState<number>(6);
  const [deletingIds, setDeletingIds] = useState<Record<string, boolean>>({});
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newHoverRating, setNewHoverRating] = useState<number | null>(null);
  const [newTag, setNewTag] = useState(QUICK_REVIEW_TAGS[0]);
  const [newAuthor, setNewAuthor] = useState('');
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToCommunityReviews(updatedReviews => {
      setReviews(updatedReviews);
    });
    return () => unsubscribe();
  }, []);

  const handleDeleteReview = async (reviewId: string) => {
    setDeletingIds(prev => ({ ...prev, [reviewId]: true }));
    try {
      await deleteCommunityReview(reviewId);
      setReviews(prev => prev.filter(item => item.id !== reviewId));
    } catch (error) {
      console.error('Failed to delete review:', error);
    } finally {
      setDeletingIds(prev => {
        const next = { ...prev };
        delete next[reviewId];
        return next;
      });
    }
  };

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const created = await submitCommunityReview({
        authorName: newAuthor,
        rating: newRating,
        comment: newComment.trim() || newTag,
        quickTag: newTag
      });
      setReviews(prev => [created, ...prev.filter(r => r.id !== created.id)]);
      setNewComment('');
      setSubmitSuccess(true);
      setTimeout(() => {
        setIsFormOpen(false);
        setSubmitSuccess(false);
      }, 500);
    } catch (err) {
      console.error('Failed to submit review from footer:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const stats = useMemo(() => {
    const total = reviews.length;
    if (total === 0) {
      return {
        average: '0.0',
        total: 0,
        counts: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } as Record<number, number>
      };
    }
    const counts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let sum = 0;
    for (const r of reviews) {
      const clamped = Math.min(5, Math.max(1, Math.round(r.rating)));
      counts[clamped] = (counts[clamped] || 0) + 1;
      sum += clamped;
    }
    return {
      average: (sum / total).toFixed(1),
      total,
      counts
    };
  }, [reviews]);

  const filteredReviews = useMemo(() => {
    if (selectedFilter === 'all') return reviews;
    if (selectedFilter === 5) return reviews.filter(r => r.rating === 5);
    if (selectedFilter === 4) return reviews.filter(r => r.rating === 4);
    return reviews.filter(r => r.rating <= 3);
  }, [reviews, selectedFilter]);

  const displayedReviews = useMemo(
    () => filteredReviews.slice(0, visibleCount),
    [filteredReviews, visibleCount]
  );

  return (
    <footer
      id="community-reviews-footer"
      className="mt-12 border-t border-[var(--border-subtle)] bg-[var(--card-surface)] text-[var(--text-primary)] transition-colors"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--border-subtle)]">
          <div>
            <p className="text-xs font-semibold text-[#4f80b9] dark:text-[#7da7d9] mb-1">
              Đánh giá thực tế từ người dùng
            </p>
            <h2
              className="text-lg sm:text-xl font-bold tracking-tight text-[var(--text-primary)]"
              style={{ textWrap: 'balance' }}
            >
              Đánh Giá & Nhận Xét Cộng Đồng ({stats.total})
            </h2>
          </div>

          {/* Actions & Filter Tabs */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setIsFormOpen(prev => !prev)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shadow-xs ${
                isFormOpen
                  ? 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                  : 'bg-[#4f80b9] hover:bg-[#3f6ca0] text-white active:scale-98'
              }`}
            >
              {isFormOpen ? <X className="w-3.5 h-3.5" /> : <PenLine className="w-3.5 h-3.5" />}
              <span>{isFormOpen ? 'Đóng form' : '+ Viết đánh giá'}</span>
            </button>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] overflow-x-auto">
              {[
                { key: 'all' as const, label: 'Tất cả' },
                { key: 5 as const, label: '5 Sao' },
                { key: 4 as const, label: '4 Sao' },
                { key: 'low' as const, label: '1–3 Sao' }
              ].map(tab => {
                const active = selectedFilter === tab.key;
                return (
                  <button
                    key={String(tab.key)}
                    type="button"
                    onClick={() => setSelectedFilter(tab.key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                      active
                        ? 'bg-[#4f80b9] text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-300 hover:text-[var(--text-primary)]'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Collapsible Quick Review Form (Accordion) */}
        <AnimatePresence>
          {isFormOpen && (
            <motion.form
              initial={{ opacity: 0, height: 0, y: -6 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -6 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              onSubmit={handleAddReview}
              className="mt-5 rounded-2xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] p-3.5 sm:p-4 space-y-2.5 overflow-hidden shadow-xs"
            >
              {/* Row 1: Star Rating + Quick Tags Chips */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-[var(--border-subtle)]">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                    Đánh giá:
                  </span>
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map(star => {
                      const active = star <= (newHoverRating ?? newRating);
                      return (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setNewRating(star)}
                          onMouseEnter={() => setNewHoverRating(star)}
                          onMouseLeave={() => setNewHoverRating(null)}
                          className="p-1 rounded hover:scale-120 transition-transform cursor-pointer"
                        >
                          <Star
                            className={`w-5 h-5 transition-colors ${
                              active
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-slate-300 dark:text-slate-600'
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>
                  <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                    {newRating} sao
                  </span>
                </div>

                {/* Quick tags */}
                <div className="flex flex-wrap items-center gap-1.5">
                  {QUICK_REVIEW_TAGS.map(tag => {
                    const isSelected = newTag === tag;
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => setNewTag(tag)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                          isSelected
                            ? 'bg-[#4f80b9] text-white font-semibold'
                            : 'bg-[var(--card-surface)] text-slate-600 dark:text-slate-300 border border-[var(--border-subtle)] hover:bg-[var(--hover-bg)]'
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Row 2: Name Input + Comment Input + Submit Button */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <input
                  type="text"
                  maxLength={40}
                  value={newAuthor}
                  onChange={e => setNewAuthor(e.target.value)}
                  placeholder="Tên bạn (tùy chọn)"
                  className="sm:w-48 px-3 py-1.5 rounded-xl bg-[var(--card-surface)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#4f80b9]"
                />
                <input
                  type="text"
                  maxLength={400}
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  placeholder="Góp ý hoặc nhận xét ngắn (để trống lấy theo nhãn đã chọn)..."
                  className="flex-1 px-3 py-1.5 rounded-xl bg-[var(--card-surface)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#4f80b9]"
                />
                <button
                  type="submit"
                  disabled={isSubmitting || submitSuccess}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#4f80b9] hover:bg-[#3f6ca0] disabled:opacity-60 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer whitespace-nowrap"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submitSuccess ? 'Đã lưu!' : isSubmitting ? 'Đang gửi...' : 'Gửi Đánh Giá'}</span>
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Main Content: Left = Rating Summary, Right = Real User Reviews */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6 items-start">
          {/* Rating Overview (4 cols) */}
          <div className="lg:col-span-4">
            <div className="rounded-2xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] p-5">
              <div className="flex items-center gap-5">
                <div className="text-center shrink-0 pr-5 border-r border-[var(--border-subtle)]">
                  <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--text-primary)] tabular-nums">
                    {stats.average}
                  </div>
                  <div className="flex items-center justify-center gap-0.5 my-1.5">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          stats.total > 0 && star <= Math.round(Number(stats.average))
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-300 dark:text-slate-600'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                    {stats.total} lượt đánh giá
                  </p>
                </div>

                {/* Star Distribution Bars */}
                <div className="flex-1 space-y-1.5 text-xs tabular-nums">
                  {[5, 4, 3, 2, 1].map(star => {
                    const count = stats.counts[star] || 0;
                    const percent = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                    return (
                      <div key={star} className="flex items-center gap-2">
                        <span className="w-10 text-slate-600 dark:text-slate-300 font-medium shrink-0">
                          {star} sao
                        </span>
                        <div className="flex-1 h-2 rounded-full bg-slate-200/80 dark:bg-slate-700/70 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-amber-400 transition-all duration-300"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <span className="w-8 text-right text-slate-500 dark:text-slate-400 shrink-0">
                          {count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Reviews List (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            {displayedReviews.length === 0 ? (
              <div className="rounded-2xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] p-8 text-center">
                <Users className="w-7 h-7 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-[var(--text-primary)]">
                  Chưa có đánh giá nào được gửi
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Các đánh giá do người dùng gửi từ Popup lúc mở trang web sẽ được lưu và hiển thị tại đây.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {displayedReviews.map(item => {
                  const ownedByMe = isMyReview(item);
                  const isDeleting = Boolean(deletingIds[item.id]);

                  return (
                    <article
                      key={item.id}
                      className="rounded-2xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] p-4 transition-colors flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-3 mb-2.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-[#4f80b9]/15 text-[#4f80b9] dark:text-[#7da7d9] font-bold text-xs flex items-center justify-center shrink-0">
                              {item.authorName.trim().charAt(0).toUpperCase() || 'S'}
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-[var(--text-primary)] leading-tight">
                                {item.authorName}
                              </h4>
                              <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                <span>{item.quickTag}</span>
                                <span aria-hidden="true">·</span>
                                <span className="tabular-nums">
                                  {formatRelativeTime(item.createdAt)}
                                </span>
                                {ownedByMe && (
                                  <>
                                    <span aria-hidden="true">·</span>
                                    <span className="font-semibold text-[#4f80b9] dark:text-[#7da7d9]">
                                      Của bạn
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <div
                              className="flex items-center gap-0.5"
                              aria-label={`Đánh giá ${item.rating} trên 5 sao`}
                            >
                              {[1, 2, 3, 4, 5].map(star => (
                                <Star
                                  key={star}
                                  className={`w-3.5 h-3.5 ${
                                    star <= item.rating
                                      ? 'text-amber-400 fill-amber-400'
                                      : 'text-slate-300 dark:text-slate-600'
                                  }`}
                                />
                              ))}
                            </div>

                            {ownedByMe && (
                              <button
                                type="button"
                                disabled={isDeleting}
                                onClick={() => handleDeleteReview(item.id)}
                                title="Xoá đánh giá của bạn"
                                aria-label="Xoá đánh giá của bạn"
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 disabled:opacity-50 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>{isDeleting ? 'Đang xoá...' : 'Xoá'}</span>
                              </button>
                            )}
                          </div>
                        </div>

                        <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-line">
                          {item.comment}
                        </p>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}

            {filteredReviews.length > 6 && (
              <div className="flex items-center justify-center pt-2">
                {visibleCount < filteredReviews.length ? (
                  <button
                    type="button"
                    onClick={() => setVisibleCount(prev => prev + 6)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--bg-canvas)] hover:bg-[var(--hover-bg)] border border-[var(--border-subtle)] text-xs font-semibold text-[var(--text-primary)] transition-colors cursor-pointer"
                  >
                    <ChevronDown className="w-4 h-4" />
                    Xem thêm đánh giá ({filteredReviews.length - visibleCount})
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setVisibleCount(6)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--bg-canvas)] hover:bg-[var(--hover-bg)] border border-[var(--border-subtle)] text-xs font-semibold text-[var(--text-primary)] transition-colors cursor-pointer"
                  >
                    <ChevronUp className="w-4 h-4" />
                    Thu gọn danh sách
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Copyright & Info Bar */}
        <div className="mt-8 pt-6 border-t border-[var(--border-subtle)] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-[#4f80b9]" />
            <span>
              Hệ thống Luyện thi Trắc nghiệm SQA Quiz Pro · Đảm bảo chất lượng phần mềm
            </span>
          </div>
          <div className="flex items-center gap-2 tabular-nums">
            <span>Tổng cộng {totalQuestionsCount} câu hỏi chuẩn</span>
            <span aria-hidden="true">·</span>
            <span>Tự động chấm điểm & Lưu lịch sử</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
