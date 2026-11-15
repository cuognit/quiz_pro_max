# Security Specification (`security_spec.md`)

## 1. Data Invariants
1. **Strict Schema Enforcement**: Every document in `/reviews/{reviewId}` must contain ONLY the required keys `['authorName', 'rating', 'comment', 'quickTag', 'isPublic', 'createdAt']`. No shadow or extra fields are permitted.
2. **Path Variable Hardening**: `reviewId` must match `^[a-zA-Z0-9_\-]+$` and be at most 128 characters.
3. **Field Bounds & Type Safety**:
   - `authorName`: string, `1 <= size() <= 40`
   - `rating`: int, `1 <= rating <= 5`
   - `comment`: string, `1 <= size() <= 400`
   - `quickTag`: string, `1 <= size() <= 50`
   - `isPublic`: bool, must be `true`
   - `createdAt`: timestamp, must strictly equal `request.time`
4. **Immutability**: Reviews are append-only (`allow update, delete: if false;`), eliminating all update-gap and unauthorized deletion vectors.
5. **Query Enforcer**: `allow list` and `allow get` require `resource.data.isPublic == true`.

## 2. The "Dirty Dozen" Payloads
1. **Shadow Field Injection**: `{ authorName: "An", rating: 5, comment: "Tốt", quickTag: "Đề chuẩn 100%", isPublic: true, createdAt: SERVER_TIME, isAdmin: true }` -> `PERMISSION_DENIED`
2. **Oversized Author Name**: `{ authorName: "A".repeat(41), rating: 5, comment: "Tốt", quickTag: "Đề chuẩn", isPublic: true, createdAt: SERVER_TIME }` -> `PERMISSION_DENIED`
3. **Empty Author Name**: `{ authorName: "", rating: 5, comment: "Tốt", quickTag: "Đề chuẩn", isPublic: true, createdAt: SERVER_TIME }` -> `PERMISSION_DENIED`
4. **Invalid Rating High**: `{ authorName: "An", rating: 6, comment: "Tốt", quickTag: "Đề chuẩn", isPublic: true, createdAt: SERVER_TIME }` -> `PERMISSION_DENIED`
5. **Invalid Rating Low**: `{ authorName: "An", rating: 0, comment: "Tốt", quickTag: "Đề chuẩn", isPublic: true, createdAt: SERVER_TIME }` -> `PERMISSION_DENIED`
6. **Non-Integer Rating Type**: `{ authorName: "An", rating: "5", comment: "Tốt", quickTag: "Đề chuẩn", isPublic: true, createdAt: SERVER_TIME }` -> `PERMISSION_DENIED`
7. **Oversized Comment (DoW Attack)**: `{ authorName: "An", rating: 5, comment: "X".repeat(401), quickTag: "Đề chuẩn", isPublic: true, createdAt: SERVER_TIME }` -> `PERMISSION_DENIED`
8. **Empty Comment**: `{ authorName: "An", rating: 5, comment: "", quickTag: "Đề chuẩn", isPublic: true, createdAt: SERVER_TIME }` -> `PERMISSION_DENIED`
9. **Spoofed Timestamp (Past/Future)**: `{ authorName: "An", rating: 5, comment: "Tốt", quickTag: "Đề chuẩn", isPublic: true, createdAt: Timestamp.fromMillis(1000) }` -> `PERMISSION_DENIED`
10. **Private Document Injection**: `{ authorName: "An", rating: 5, comment: "Tốt", quickTag: "Đề chuẩn", isPublic: false, createdAt: SERVER_TIME }` -> `PERMISSION_DENIED`
11. **ID Poisoning Attack**: Document ID containing spaces or special characters (`review/../hack`) -> `PERMISSION_DENIED`
12. **Unauthorized Mutation/Deletion**: Any `updateDoc` or `deleteDoc` call on an existing review -> `PERMISSION_DENIED`
