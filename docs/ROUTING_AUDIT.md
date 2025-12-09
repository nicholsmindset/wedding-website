# Routing & Navigation Audit Report

**Application:** Wedding Website
**Framework:** React 18.3.1 + React Router DOM 7.3.0
**Date:** December 8, 2025
**Auditor:** Claude Code

---

## Executive Summary

This application uses a **minimal routing architecture** with only 3 client-side routes and 4 API routes. The routing strategy relies heavily on **conditional rendering** rather than traditional route guards. While simple and functional, several improvements are recommended for scalability, SEO, and user experience.

### Key Findings
- **3 client-side routes** (1 protected, 1 public with token auth, 1 callback)
- **No dedicated 404 page** - only API-level 404 handling
- **No SEO optimization** - missing meta tags, sitemap, robots.txt
- **No Link components used** - navigation is state-driven
- **No breadcrumbs** implemented
- **No route-based code splitting** - all components loaded upfront

---

## 1. Route Inventory

### Client-Side Routes

| Route | Component | Auth Required | Roles | Parameters | Status |
|-------|-----------|---------------|-------|------------|--------|
| `/` | `AppContent` → `LandingPage` / `WeddingDashboard` | Conditional | - | None | OK |
| `/rsvp/:weddingId` | `PublicRSVP` | Token-based | Guest | `weddingId` (path), `email`, `token` (query) | OK |
| `/auth/callback` | Inline `<div>` | No | - | None | **Needs Improvement** |

### API Routes (Express Backend)

| Route | Method | Auth | Purpose | Status |
|-------|--------|------|---------|--------|
| `/api/health` | GET | No | Health check | OK |
| `/api/auth/register` | POST | No | Placeholder (501) | **Not Implemented** |
| `/api/auth/login` | POST | No | Placeholder (501) | **Not Implemented** |
| `/api/auth/logout` | POST | No | Placeholder (501) | **Not Implemented** |
| `/api/*` (fallback) | ALL | - | 404 handler | OK |

### Route Details

#### Route: `/` (Home/Dashboard)
- **File:** `src/App.tsx:33`
- **Component:** `AppContent` (wrapper with conditional rendering)
- **Behavior:**
  - If `loading`: Shows spinner
  - If `user` authenticated: Renders `WeddingDashboard`
  - If no user: Renders `LandingPage`
- **Sub-navigation:** State-driven (not URL-based)
  - Wedding selection: `setCurrentWedding(wedding)`
  - Create form: `setShowCreateForm(true)`
  - Photo upload modal: `setShowPhotoUpload(true)`

#### Route: `/rsvp/:weddingId` (Public RSVP)
- **File:** `src/App.tsx:34`
- **Component:** `PublicRSVP`
- **Parameters:**
  - Path: `weddingId` (required)
  - Query: `email` (required), `token` (required)
- **Access Control:** Token-based verification
  1. Validates token exists in `invitation_tokens` table
  2. Checks token expiration (30-day validity)
  3. Verifies token hasn't been used
  4. Marks token as used after RSVP submission

#### Route: `/auth/callback` (Auth Callback)
- **File:** `src/App.tsx:35`
- **Component:** Inline JSX (`<div>Authentication successful! Redirecting...</div>`)
- **Purpose:** Supabase magic link callback destination
- **Issues:**
  - No actual redirect logic implemented
  - Bare minimum implementation
  - Should redirect to `/` after callback processing

---

## 2. Route Configuration Analysis

### Route Definitions
- **Location:** `src/App.tsx` (centralized, monolithic)
- **Structure:** Flat route hierarchy (no nested routes)
- **Naming:** Follows RESTful conventions

### Issues Found

| Issue | Severity | Location | Description |
|-------|----------|----------|-------------|
| No 404 route | High | `src/App.tsx` | Missing catch-all route for invalid URLs |
| Inline callback component | Medium | `src/App.tsx:35` | Auth callback uses inline JSX instead of proper component |
| No nested routes | Low | `src/App.tsx` | Dashboard could benefit from nested routes (e.g., `/dashboard/weddings/:id`) |
| No route constants | Low | - | Route paths hardcoded as strings |

### Route Organization Assessment
```
Current Structure:
├── /                    (conditional: Landing OR Dashboard)
├── /rsvp/:weddingId     (public with token)
└── /auth/callback       (auth callback)

Recommended Structure:
├── /                    (Landing page only)
├── /dashboard           (Protected - redirect if not auth)
│   ├── /dashboard/weddings
│   ├── /dashboard/weddings/:id
│   └── /dashboard/weddings/:id/photos
├── /rsvp/:weddingId     (Public with token)
├── /auth/callback       (Auth callback with redirect)
└── /*                   (404 catch-all)
```

---

## 3. Navigation Guards & Middleware

### Current Authentication Flow

```
┌─────────────────────────────────────────────┐
│               AuthProvider                   │
│  (wraps entire app in AuthContext)          │
└─────────────────────┬───────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────┐
│            AppContent Component              │
│                                              │
│  if (loading) → Spinner                     │
│  if (user)    → WeddingDashboard            │
│  if (!user)   → LandingPage                 │
└─────────────────────────────────────────────┘
```

### Authentication Implementation
- **Method:** Supabase Auth with Magic Links (OTP via email)
- **Session Management:** `supabase.auth.getSession()` + `onAuthStateChange()`
- **Context:** `src/contexts/AuthContext.tsx`

### Token-Based Access (RSVP)
```typescript
// PublicRSVP.tsx verification flow
1. Extract params: weddingId, email, token
2. Query invitation_tokens table
3. Check token expiration (isTokenExpired)
4. Check token.used === false
5. If valid: fetch wedding data
6. On RSVP submit: mark token as used
```

### Issues Found

| Issue | Severity | Description |
|-------|----------|-------------|
| No ProtectedRoute component | Medium | Uses conditional rendering instead of route guards |
| No role-based routing | Low | RBAC exists in data model but not enforced in routes |
| No redirect after auth | Medium | Callback route doesn't redirect to intended destination |
| No "remember destination" | Medium | After login, user goes to `/` not their intended page |

### Missing Guards
- [ ] `ProtectedRoute` wrapper component
- [ ] `AdminRoute` for admin-only pages
- [ ] Role-based route guards (planner, vendor, guest roles exist in schema)
- [ ] Rate limiting on public routes

---

## 4. Navigation UX Analysis

### Current Navigation Patterns

#### Landing Page (`LandingPage.tsx`)
- **Anchor links:** `#features`, `#pricing`, `#contact`
- **Scroll behavior:** Smooth scroll to email input
- **No React Router Links used**

#### Dashboard (`WeddingDashboard.tsx`)
- **State-driven navigation:**
  - Wedding selection: `onClick={() => setCurrentWedding(wedding)}`
  - Back button: `onClick={() => setCurrentWedding(null)}`
  - Modal toggles: `setShowCreateForm`, `setShowPhotoUpload`
- **No URL changes for sub-views**

#### Public RSVP (`PublicRSVP.tsx`)
- **URL-based routing with params**
- **No navigation away from page**

### Issues Found

| Issue | Severity | Description |
|-------|----------|-------------|
| No breadcrumbs | Medium | Dashboard has nested views but no breadcrumb trail |
| No active state indicators | Medium | Header nav lacks active state styling |
| No deep linking | High | Cannot link directly to a specific wedding view |
| No browser history integration | High | Back button doesn't work within dashboard |
| URL doesn't reflect state | High | Selected wedding not in URL |

### Recommended Improvements
1. **Add `<Link>` components** for internal navigation
2. **Implement breadcrumbs** for dashboard hierarchy
3. **Use URL params** for wedding selection (`/dashboard/weddings/:id`)
4. **Add active state** to nav links using `NavLink`
5. **Preserve scroll position** on navigation

---

## 5. Dynamic Routing Analysis

### Current Dynamic Routes

| Route Pattern | Validation | Error Handling |
|---------------|------------|----------------|
| `/rsvp/:weddingId` | UUID from Supabase query | Generic error message |

### Parameter Handling

```typescript
// PublicRSVP.tsx
const { weddingId } = useParams<{ weddingId: string }>()
const [searchParams] = useSearchParams()
const guestEmail = searchParams.get('email')
const token = searchParams.get('token')
```

### Issues Found

| Issue | Severity | Description |
|-------|----------|-------------|
| No param validation | Medium | `weddingId` not validated as UUID format |
| No type coercion | Low | All params treated as strings |
| Missing params show generic error | Low | Could be more specific error messages |

### Missing Route Patterns
- [ ] Catch-all route (`/*` or `*`)
- [ ] Optional parameters
- [ ] Query string validation schema

---

## 6. SEO & Metadata Analysis

### Current State

| Item | Implemented | Location |
|------|-------------|----------|
| Page title | Partial | `index.html` (static: "My Trae Project") |
| Meta description | No | - |
| Open Graph tags | No | - |
| Twitter cards | No | - |
| Canonical URLs | No | - |
| Sitemap | No | - |
| Robots.txt | No | - |
| Structured data | No | - |

### index.html Analysis
```html
<!-- Current -->
<title>My Trae Project</title>

<!-- Missing -->
<meta name="description" content="...">
<meta property="og:title" content="...">
<meta property="og:description" content="...">
<meta property="og:image" content="...">
<meta name="twitter:card" content="...">
```

### Issues Found

| Issue | Severity | Description |
|-------|----------|-------------|
| Generic page title | High | "My Trae Project" instead of "Dream Wedding Day" |
| No meta description | High | Missing SEO description |
| No OG tags | Medium | Poor social media sharing |
| No per-route titles | Medium | All pages have same title |
| No sitemap.xml | Medium | Search engine discovery |
| No robots.txt | Low | Crawler instructions |

### Recommended SEO Implementation
```typescript
// Use react-helmet-async or similar
<Helmet>
  <title>{wedding?.title} | Dream Wedding Day</title>
  <meta name="description" content={wedding?.description} />
  <meta property="og:title" content={wedding?.title} />
  <meta property="og:image" content={wedding?.coverPhoto} />
</Helmet>
```

---

## 7. Performance Analysis

### Current State

| Feature | Implemented | Notes |
|---------|-------------|-------|
| Code splitting | No | All components bundled together |
| Lazy loading | No | All routes load immediately |
| Prefetching | Partial | PWA caches assets |
| Route transitions | No | No animations |

### Bundle Analysis
- **React Router:** Full bundle imported
- **All components:** Loaded on initial render
- **No `React.lazy()`** usage found

### PWA Configuration (vite.config.ts)
```typescript
// Good: Caching strategies implemented
- wedding-photos: CacheFirst (30 days)
- supabase-api: NetworkFirst (5 minutes)
- Static assets: Precached
```

### Issues Found

| Issue | Severity | Description |
|-------|----------|-------------|
| No code splitting | Medium | Large initial bundle |
| No lazy routes | Medium | All routes load upfront |
| No loading states for routes | Low | Abrupt transitions |
| No prefetch on hover | Low | Could improve perceived performance |

### Recommended Code Splitting
```typescript
// Lazy load route components
const WeddingDashboard = lazy(() => import('./components/WeddingDashboard'))
const PublicRSVP = lazy(() => import('./components/PublicRSVP'))
const LandingPage = lazy(() => import('./components/LandingPage'))

// Wrap routes in Suspense
<Suspense fallback={<LoadingSpinner />}>
  <Routes>
    <Route path="/" element={<AppContent />} />
    ...
  </Routes>
</Suspense>
```

---

## 8. Security Assessment

### Route Security

| Route | Protection | Assessment |
|-------|------------|------------|
| `/` | Auth context check | **OK** - Conditional rendering |
| `/rsvp/:weddingId` | Token verification | **OK** - Expiration + usage check |
| `/auth/callback` | None (public) | **OK** - Expected public |
| `/api/*` | CORS configured | **OK** - Origin whitelist |

### Token Security (tokens.ts)
```typescript
// Good practices:
- crypto.randomUUID() for token generation
- Fallback to crypto.getRandomValues()
- 30-day expiration
- Single-use tokens (marked as used after RSVP)
```

### Issues Found

| Issue | Severity | Description |
|-------|----------|-------------|
| Token in URL | Low | Token visible in URL (standard for magic links) |
| No CSRF protection | Low | Supabase handles this |
| No rate limiting | Medium | RSVP endpoint could be abused |

---

## 9. Recommendations Summary

### Critical (Should Fix)

1. **Add 404 catch-all route**
   ```typescript
   <Route path="*" element={<NotFoundPage />} />
   ```

2. **Fix auth callback route**
   ```typescript
   // Create proper AuthCallback component with redirect
   <Route path="/auth/callback" element={<AuthCallback />} />
   ```

3. **Enable deep linking for dashboard**
   ```typescript
   <Route path="/dashboard/weddings/:weddingId" element={<WeddingDetail />} />
   ```

4. **Update page title**
   - Change `index.html` title from "My Trae Project" to "Dream Wedding Day"

### High Priority

5. **Add SEO meta tags**
   - Install `react-helmet-async`
   - Add meta descriptions per route

6. **Implement ProtectedRoute component**
   ```typescript
   function ProtectedRoute({ children }) {
     const { user, loading } = useAuth()
     if (loading) return <Spinner />
     if (!user) return <Navigate to="/" replace />
     return children
   }
   ```

7. **Add breadcrumb navigation**
   - Home > Weddings > [Wedding Name] > Photos

### Medium Priority

8. **Implement code splitting**
   - Use `React.lazy()` for route components
   - Add `<Suspense>` boundaries

9. **Create route constants file**
   ```typescript
   export const ROUTES = {
     HOME: '/',
     DASHBOARD: '/dashboard',
     RSVP: (id: string) => `/rsvp/${id}`,
     AUTH_CALLBACK: '/auth/callback',
   }
   ```

10. **Add sitemap.xml and robots.txt**

### Low Priority

11. **Add route transition animations**
12. **Implement prefetching on link hover**
13. **Add URL-based state for modals**

---

## 10. Route Table (Complete)

### Frontend Routes

| Route | Component | Auth | Roles | Params | Query Params | Deep Link | Status |
|-------|-----------|------|-------|--------|--------------|-----------|--------|
| `/` | `AppContent` | Conditional | - | - | - | No | **OK** |
| `/rsvp/:weddingId` | `PublicRSVP` | Token | Guest | `weddingId` | `email`, `token` | Yes | **OK** |
| `/auth/callback` | Inline div | No | - | - | Supabase params | No | **Needs Work** |
| `/*` | N/A | - | - | - | - | - | **Missing** |

### Backend Routes

| Route | Method | Auth | Body | Response | Status |
|-------|--------|------|------|----------|--------|
| `GET /api/health` | GET | No | - | `{ success, message, timestamp }` | **OK** |
| `POST /api/auth/register` | POST | No | - | 501 Not Implemented | **Placeholder** |
| `POST /api/auth/login` | POST | No | - | 501 Not Implemented | **Placeholder** |
| `POST /api/auth/logout` | POST | No | - | 501 Not Implemented | **Placeholder** |
| `* /api/*` | ALL | - | - | 404 Not Found | **OK** |

---

## Appendix: File References

| File | Line | Purpose |
|------|------|---------|
| `src/App.tsx` | 1-40 | Main router configuration |
| `src/contexts/AuthContext.tsx` | 1-61 | Authentication context & hooks |
| `src/components/PublicRSVP.tsx` | 1-357 | Public RSVP page with token auth |
| `src/components/WeddingDashboard.tsx` | 1-302 | Protected dashboard |
| `src/components/LandingPage.tsx` | 1-188 | Public landing page |
| `src/lib/tokens.ts` | 1-52 | Token utilities |
| `src/stores/weddingStore.ts` | 1-279 | State management |
| `api/app.ts` | 1-82 | Express server setup |
| `api/routes/auth.ts` | 1-54 | Auth route placeholders |
| `vite.config.ts` | 1-107 | Build config with PWA |
| `index.html` | 1-25 | HTML template |

---

## Conclusion

The routing architecture is **functional but minimal**. For a wedding website MVP, it works. However, for production use with multiple users and SEO requirements, the following are essential:

1. Add a 404 page
2. Fix the auth callback route
3. Update page metadata
4. Enable deep linking to specific weddings
5. Implement proper route guards

Estimated effort: **1-2 days** for critical fixes, **3-5 days** for full improvements.
