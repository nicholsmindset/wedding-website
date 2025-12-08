# State Management Audit Report

**Project:** Wedding Website
**Date:** December 8, 2025
**Framework:** React 18.3.1 with TypeScript

---

## Executive Summary

This application uses a **lean, pragmatic state management approach** combining:
- **Zustand** for global wedding data
- **React Context** for authentication
- **Local useState** for UI state
- **Supabase** for server state with real-time subscriptions

The architecture is appropriate for the application's complexity, though several optimization opportunities exist.

---

## 1. State Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           APPLICATION STATE FLOW                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                              GLOBAL STATE LAYER                              │
├─────────────────────────────────┬───────────────────────────────────────────┤
│     AuthContext (React)         │         WeddingStore (Zustand)             │
│  ┌───────────────────────┐      │      ┌──────────────────────────────┐     │
│  │ user: User | null     │      │      │ weddings: Wedding[]           │     │
│  │ loading: boolean      │      │      │ currentWedding: Wedding|null  │     │
│  │ signIn()              │      │      │ events: Event[]               │     │
│  │ signOut()             │      │      │ guests: Guest[]               │     │
│  └───────────────────────┘      │      │ rsvps: RSVP[]                 │     │
│             │                   │      │ photos: Photo[]               │     │
│             ▼                   │      │ loading: boolean              │     │
│    Supabase Auth               │      │ error: string | null          │     │
│  ┌───────────────────────┐      │      │                               │     │
│  │ - OTP Magic Links     │      │      │ Actions:                      │     │
│  │ - Session Management  │      │      │ - fetchWeddings()             │     │
│  │ - Auth State Change   │      │      │ - createWedding()             │     │
│  └───────────────────────┘      │      │ - fetchWeddingDetails()       │     │
│                                 │      │ - subscribeToWedding()        │     │
│                                 │      └──────────────────────────────┘     │
└─────────────────────────────────┴───────────────────────────────────────────┘
                    │                                  │
                    └──────────────┬───────────────────┘
                                   ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                             SERVER STATE LAYER                               │
│                              (Supabase Backend)                              │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐  │
│  │  weddings   │    │   events    │    │   guests    │    │   rsvps     │  │
│  └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘  │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────────────────────┐  │
│  │   photos    │    │ inv_tokens  │    │    wedding-photos (Storage)     │  │
│  └─────────────┘    └─────────────┘    └─────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────────────────────┤
│                         REAL-TIME SUBSCRIPTIONS                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │  Channel: photos:{weddingId}  → INSERT/DELETE → Update store.photos    ││
│  │  Channel: guests:{weddingId}  → INSERT/DELETE/UPDATE → Update store    ││
│  │  Channel: rsvps:{weddingId}   → INSERT/UPDATE → Update store.rsvps     ││
│  └─────────────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           LOCAL COMPONENT STATE                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  WeddingDashboard          RSVPManager               PublicRSVP             │
│  ├─ showCreateForm         ├─ guests[]  ⚠️ DUPLICATE   ├─ wedding            │
│  └─ showPhotoUpload        ├─ rsvps[]   ⚠️ DUPLICATE   ├─ events[]           │
│                            ├─ invitationDialogOpen    ├─ loading             │
│  PhotoUpload               ├─ invitations[]           ├─ error               │
│  ├─ dragActive             ├─ sendingInvitations      ├─ rsvpSubmitted       │
│  ├─ preview                ├─ selectedEvent           ├─ submittedData       │
│  └─ selectedFile           ├─ previewDialogOpen       └─ verifiedToken       │
│                            └─ previewData                                    │
│  WeddingForm                                                                 │
│  ├─ formData{}             RSVPForm                   PhotoGallery          │
│  └─ error                  └─ formData{}              └─ selectedPhoto       │
│                                                                              │
│  AIAnalysis                RealtimeNotifications      LandingPage           │
│  ├─ analyzing              └─ notifications[]         ├─ email               │
│  ├─ analysis                                          ├─ loading             │
│  └─ error                  PWAInstaller               └─ message             │
│                            ├─ deferredPrompt                                 │
│                            ├─ showInstallButton                              │
│                            ├─ isOnline                                       │
│                            ├─ updateAvailable                                │
│                            └─ registration                                   │
└─────────────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              PERSISTENT STATE                                │
├─────────────────────────────────────────────────────────────────────────────┤
│  localStorage               │  URL State                                     │
│  ├─ theme: 'light'|'dark'  │  ├─ /rsvp/:weddingId                           │
│  └─ (via useTheme hook)    │  ├─ ?email={guestEmail}                        │
│                             │  └─ ?token={invitationToken}                   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Global State Analysis

### 2.1 Zustand Store (`src/stores/weddingStore.ts`)

**What's Stored:**
| State Key | Type | Description |
|-----------|------|-------------|
| `weddings` | `Wedding[]` | All weddings for current user |
| `currentWedding` | `Wedding \| null` | Selected wedding being managed |
| `events` | `Event[]` | Events for current wedding |
| `guests` | `Guest[]` | Guests for current wedding |
| `rsvps` | `RSVP[]` | RSVPs for current wedding |
| `photos` | `Photo[]` | Photos for current wedding |
| `loading` | `boolean` | Single loading indicator |
| `error` | `string \| null` | Error message |

**Assessment:**
- ✅ Appropriate use of Zustand for cross-component wedding data
- ✅ Good separation of data by entity type
- ⚠️ Single `loading` boolean for all async operations (can cause false positives)
- ⚠️ Single `error` string loses context about which operation failed

### 2.2 Auth Context (`src/contexts/AuthContext.tsx`)

**What's Stored:**
| State Key | Type | Description |
|-----------|------|-------------|
| `user` | `User \| null` | Supabase user object |
| `loading` | `boolean` | Auth initialization state |

**Assessment:**
- ✅ Clean implementation with proper cleanup
- ✅ Correct use of Context for auth (changes infrequently)
- ✅ Proper subscription to auth state changes

### 2.3 Global State Usage

| Store | Components Using |
|-------|------------------|
| AuthContext | `App.tsx`, `WeddingDashboard.tsx`, `LandingPage.tsx` |
| WeddingStore | `WeddingDashboard.tsx`, `WeddingForm.tsx`, `PhotoUpload.tsx` |

---

## 3. Local Component State Analysis

### 3.1 Components with Complex Local State

**RSVPManager.tsx** - **HIGH COMPLEXITY**
```typescript
const [guests, setGuests] = useState<Guest[]>([])      // 9 useState hooks
const [rsvps, setRsvps] = useState<RSVP[]>([])
const [loading, setLoading] = useState(true)           // Unused (destructured as [, setLoading])
const [invitationDialogOpen, setInvitationDialogOpen] = useState(false)
const [invitations, setInvitations] = useState<InvitationData[]>([{ email: '', name: '' }])
const [sendingInvitations, setSendingInvitations] = useState(false)
const [selectedEvent, setSelectedEvent] = useState<string>('')
const [previewDialogOpen, setPreviewDialogOpen] = useState(false)
const [previewData, setPreviewData] = useState<EmailPreviewData | null>(null)
```

**PublicRSVP.tsx** - **HIGH COMPLEXITY**
```typescript
const [wedding, setWedding] = useState<Wedding | null>(null)    // 7 useState hooks
const [events, setEvents] = useState<WeddingEvent[]>([])
const [loading, setLoading] = useState(true)
const [error, setError] = useState<string | null>(null)
const [rsvpSubmitted, setRsvpSubmitted] = useState(false)
const [submittedData, setSubmittedData] = useState<RSVPSubmitData | null>(null)
const [verifiedToken, setVerifiedToken] = useState<InvitationToken | null>(null)
```

**PWAInstaller.tsx** - **MEDIUM COMPLEXITY**
```typescript
const [deferredPrompt, setDeferredPrompt] = useState(null)    // 5 useState hooks
const [showInstallButton, setShowInstallButton] = useState(false)
const [isOnline, setIsOnline] = useState(navigator.onLine)
const [updateAvailable, setUpdateAvailable] = useState(false)
const [registration, setRegistration] = useState(null)
```

### 3.2 State Duplication Issues

| Issue | Location | Impact |
|-------|----------|--------|
| `guests` duplicated | `RSVPManager` local state vs `weddingStore.guests` | Data sync issues, unnecessary re-fetches |
| `rsvps` duplicated | `RSVPManager` local state vs `weddingStore.rsvps` | Real-time updates not reflected |
| `loading` unused | `RSVPManager:38` - destructured but never read | Dead code |

### 3.3 Prop Drilling Analysis

**Minimal prop drilling detected.** The component hierarchy is relatively flat:

```
App
├── AuthProvider (context)
│   ├── WeddingDashboard
│   │   ├── WeddingForm (props: onSuccess, onCancel)
│   │   ├── PhotoUpload (props: weddingId, onUploadComplete)
│   │   ├── PhotoGallery (props: photos, weddingId)
│   │   ├── RSVPManager (props: wedding, events, onUpdate)  ← Most props
│   │   └── RealtimeNotifications (props: weddingId)
│   └── LandingPage
└── PublicRSVP (standalone, uses URL params)
```

**Verdict:** Prop drilling is not a significant issue in this codebase.

---

## 4. Server State Analysis

### 4.1 Data Fetching Patterns

**Technology:** Direct Supabase client calls (no React Query, SWR, or Apollo)

| Pattern | Location | Caching | Deduplication |
|---------|----------|---------|---------------|
| `supabase.from().select()` | Throughout | ❌ None | ❌ None |
| Parallel fetches | `weddingStore.ts:105-110` | ❌ None | ✅ Promise.all |

### 4.2 Caching Strategy

**Current:** No caching layer
- Every navigation to a wedding re-fetches all data
- No request deduplication (multiple components could trigger same fetch)
- No stale-while-revalidate pattern

### 4.3 Real-time Subscriptions

**Well Implemented:**
```typescript
// weddingStore.ts:210-278
subscribeToWedding: (weddingId: string) => {
  // Photos, Guests, RSVPs channels
  // Proper cleanup returned
}
```

**Issues:**
- `RSVPManager` doesn't use store subscriptions (fetches own data)
- Potential race condition: subscription might receive events before initial fetch completes

### 4.4 Optimistic Updates

**Current:** Not implemented
- All mutations wait for server response before updating UI
- User sees loading states for all operations

### 4.5 Error State Handling

| Component | Error Handling |
|-----------|----------------|
| Zustand Store | `error: string \| null` - loses context |
| WeddingForm | Local `error` state with display |
| RSVPManager | `toast.error()` only - no recovery |
| PublicRSVP | Local `error` state with UI display |
| AIAnalysis | Local `error` state |

---

## 5. URL State Analysis

### 5.1 Current URL State Usage

| Route | State in URL | Purpose |
|-------|-------------|---------|
| `/` | None | Main app |
| `/rsvp/:weddingId` | `weddingId` param | Public RSVP page |
| `/rsvp/:weddingId?email=...&token=...` | Query params | Magic link verification |
| `/auth/callback` | None | OAuth callback |

### 5.2 Missing URL State Opportunities

| What's Missing | Impact |
|----------------|--------|
| Selected wedding ID not in URL | Can't bookmark/share specific wedding |
| Active tab/section not in URL | Loses position on refresh |
| Filter/sort states not in URL | Can't share filtered views |

### 5.3 Deep Linking Support

**Current:** Limited
- ✅ Public RSVP pages are deep-linkable
- ❌ Dashboard views are not deep-linkable
- ❌ No way to link to specific wedding admin view

---

## 6. Form State Analysis

### 6.1 Form Library

**Current:** No form library - manual `useState` management

### 6.2 Form Patterns Used

| Form | Type | Validation |
|------|------|------------|
| WeddingForm | Controlled inputs | HTML5 `required` only |
| RSVPForm | Controlled with conditional fields | HTML5 `required` only |
| RSVPManager invitations | Dynamic array of controlled inputs | Client-side only |
| LandingPage email | Single controlled input | HTML5 `type="email"` |

### 6.3 Form State Persistence

**Current:** None
- Form data lost on navigation/refresh
- No draft saving
- No localStorage backup

### 6.4 Form Issues

| Issue | Location | Impact |
|-------|----------|--------|
| No validation feedback | All forms | Poor UX |
| No dirty/touched tracking | All forms | Can't warn on unsaved changes |
| No server-side validation display | All forms | Errors from API not shown properly |

---

## 7. Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          DATA FLOW: RSVP SUBMISSION                          │
└─────────────────────────────────────────────────────────────────────────────┘

 Guest clicks magic link
        │
        ▼
 ┌──────────────────┐
 │   PublicRSVP     │  URL: /rsvp/:weddingId?email=...&token=...
 │   Component      │
 └────────┬─────────┘
          │
          │ 1. Extract URL params
          ▼
 ┌──────────────────┐     ┌──────────────────────────────────────┐
 │  Verify Token    │────▶│ Supabase: invitation_tokens.select() │
 └────────┬─────────┘     └──────────────────────────────────────┘
          │
          │ 2. Fetch wedding data (if valid)
          ▼
 ┌──────────────────┐     ┌──────────────────────────────────────┐
 │  Fetch Wedding   │────▶│ Supabase: weddings.select()          │
 │  Fetch Events    │────▶│ Supabase: events.select()            │
 └────────┬─────────┘     └──────────────────────────────────────┘
          │
          │ 3. User fills form
          ▼
 ┌──────────────────┐
 │   RSVPForm       │  Local state: formData {}
 │   (child)        │
 └────────┬─────────┘
          │
          │ 4. Submit
          ▼
 ┌──────────────────┐     ┌──────────────────────────────────────┐
 │ handleRSVPSubmit │────▶│ guests.upsert()                      │
 │                  │────▶│ rsvps.upsert() for each event        │
 │                  │────▶│ invitation_tokens.update(used: true) │
 └────────┬─────────┘     └──────────────────────────────────────┘
          │
          │ 5. Show success
          ▼
 ┌──────────────────┐
 │  Success Screen  │  rsvpSubmitted = true
 └──────────────────┘


┌─────────────────────────────────────────────────────────────────────────────┐
│                    DATA FLOW: DASHBOARD REAL-TIME UPDATES                    │
└─────────────────────────────────────────────────────────────────────────────┘

 ┌──────────────────┐         ┌──────────────────┐
 │  WeddingDashboard│         │   Supabase DB    │
 └────────┬─────────┘         └────────┬─────────┘
          │                            │
          │ useEffect: subscribeToWedding()
          │                            │
          ▼                            │
 ┌────────────────────────────────────────────────────────────────┐
 │                   SUPABASE REALTIME CHANNELS                    │
 │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
 │  │ photos:weddingId│  │ guests:weddingId│  │ rsvps:weddingId │ │
 │  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘ │
 │           │                    │                    │          │
 └───────────┼────────────────────┼────────────────────┼──────────┘
             │                    │                    │
             ▼                    ▼                    ▼
 ┌──────────────────────────────────────────────────────────────┐
 │                     ZUSTAND STORE UPDATE                     │
 │  set(state => ({ photos: [...state.photos, payload.new] }))  │
 │  set(state => ({ guests: [...state.guests, payload.new] }))  │
 │  set(state => ({ rsvps: [...state.rsvps, payload.new] }))    │
 └──────────────────────────────────────────────────────────────┘
             │
             │ Zustand triggers re-render
             ▼
 ┌──────────────────────────────────────────────────────────────┐
 │                  COMPONENTS RE-RENDER                         │
 │  PhotoGallery (photos)  │  Stats Grid  │  RSVPManager ❌      │
 │                         │              │  (doesn't use store) │
 └──────────────────────────────────────────────────────────────┘
```

---

## 8. Identified Issues

### 8.1 Critical Issues

| # | Issue | Location | Impact |
|---|-------|----------|--------|
| 1 | **State duplication** - `RSVPManager` maintains separate `guests`/`rsvps` state while same data exists in Zustand store | `RSVPManager.tsx:36-37` | Real-time updates from store not reflected; data can get out of sync |
| 2 | **Unused loading state** - `setLoading` is destructured but the `loading` value is never read | `RSVPManager.tsx:38` | Dead code, potential bugs |

### 8.2 High Priority Issues

| # | Issue | Location | Impact |
|---|-------|----------|--------|
| 3 | **Single loading boolean** for all async operations | `weddingStore.ts:33` | Can't show granular loading states |
| 4 | **No server-state caching** - every mount re-fetches | Throughout | Poor performance, unnecessary API calls |
| 5 | **No optimistic updates** - mutations wait for server | All create operations | Sluggish UX |
| 6 | **Error state loses context** - single `error` string | `weddingStore.ts:34` | Can't tell which operation failed |

### 8.3 Medium Priority Issues

| # | Issue | Location | Impact |
|---|-------|----------|--------|
| 7 | **No memoization** - missing `useMemo`/`useCallback` | Various components | Potential unnecessary re-renders |
| 8 | **URL doesn't reflect app state** - selected wedding not in URL | `WeddingDashboard.tsx` | Can't bookmark/share views |
| 9 | **Manual form handling** without validation library | `WeddingForm`, `RSVPForm` | Verbose code, weak validation |
| 10 | **No error boundaries** | App-wide | Crashes propagate up |

### 8.4 Low Priority Issues

| # | Issue | Location | Impact |
|---|-------|----------|--------|
| 11 | **Unused `useTheme` hook** exists but not integrated | `hooks/useTheme.ts` | Feature not exposed to users |
| 12 | **No form persistence** - data lost on refresh | All forms | Poor UX for long forms |
| 13 | **Potential race condition** - subscription vs initial fetch | `subscribeToWedding()` | Could miss or duplicate events |

---

## 9. Recommendations

### 9.1 Immediate Fixes (Low Effort, High Impact)

#### Fix 1: Remove RSVPManager State Duplication
```typescript
// RSVPManager.tsx - BEFORE
const [guests, setGuests] = useState<Guest[]>([])
const [rsvps, setRsvps] = useState<RSVP[]>([])

// RSVPManager.tsx - AFTER
// Use the store data passed as props or from store directly
// Remove local guests/rsvps state entirely
```

#### Fix 2: Add Granular Loading States
```typescript
// weddingStore.ts - Improve loading state
interface WeddingStore {
  // ...
  loadingStates: {
    weddings: boolean
    weddingDetails: boolean
    createWedding: boolean
    uploadPhoto: boolean
  }
}
```

#### Fix 3: Add Error Context
```typescript
// weddingStore.ts - Improve error state
interface WeddingStore {
  // ...
  errors: {
    weddings: string | null
    weddingDetails: string | null
    createWedding: string | null
    uploadPhoto: string | null
  }
}
```

### 9.2 Short-Term Improvements

#### Add React Query or TanStack Query
Benefits:
- Automatic caching and deduplication
- Stale-while-revalidate
- Retry logic
- Request cancellation
- DevTools

```typescript
// Example usage
const { data: weddings, isLoading, error } = useQuery({
  queryKey: ['weddings'],
  queryFn: () => supabase.from('weddings').select('*')
})
```

#### Add URL State Management
```typescript
// Use react-router for wedding ID in URL
<Route path="/wedding/:weddingId" element={<WeddingDashboard />} />

// In WeddingDashboard
const { weddingId } = useParams()
useEffect(() => {
  if (weddingId) setCurrentWedding(weddingId)
}, [weddingId])
```

#### Add Form Library (React Hook Form recommended)
```typescript
// RSVPForm with React Hook Form
const { register, handleSubmit, formState: { errors } } = useForm<RSVPData>()

return (
  <form onSubmit={handleSubmit(onSubmit)}>
    <input {...register('name', { required: 'Name is required' })} />
    {errors.name && <span>{errors.name.message}</span>}
  </form>
)
```

### 9.3 Long-Term Architectural Changes

#### Consider State Machine for Complex Flows
For `PublicRSVP` component with many states:
```typescript
// Using XState or similar
const rsvpMachine = createMachine({
  initial: 'loading',
  states: {
    loading: { on: { VERIFIED: 'form', INVALID: 'error' } },
    form: { on: { SUBMIT: 'submitting' } },
    submitting: { on: { SUCCESS: 'success', FAILURE: 'error' } },
    success: { type: 'final' },
    error: { type: 'final' }
  }
})
```

#### Add Optimistic Updates
```typescript
// weddingStore.ts - optimistic create
createGuest: async (guestData) => {
  const optimisticGuest = { ...guestData, id: 'temp-' + Date.now() }

  // Optimistic update
  set(state => ({ guests: [...state.guests, optimisticGuest] }))

  try {
    const { data, error } = await supabase.from('guests').insert([guestData]).select()
    if (error) throw error
    // Replace optimistic with real
    set(state => ({
      guests: state.guests.map(g =>
        g.id === optimisticGuest.id ? data : g
      )
    }))
  } catch (error) {
    // Rollback on error
    set(state => ({
      guests: state.guests.filter(g => g.id !== optimisticGuest.id)
    }))
  }
}
```

---

## 10. Summary Scorecard

| Category | Score | Notes |
|----------|-------|-------|
| **Global State Architecture** | 7/10 | Zustand well-used, but loading/error handling weak |
| **Local State Management** | 5/10 | State duplication, complex components |
| **Server State Handling** | 4/10 | No caching layer, no optimistic updates |
| **Form Management** | 5/10 | Manual handling, weak validation |
| **URL State** | 3/10 | Minimal usage, missed opportunities |
| **Real-time Sync** | 8/10 | Well-implemented subscriptions |
| **Data Flow Clarity** | 7/10 | Generally clean, some duplication |
| **Overall** | **5.6/10** | Functional but needs optimization |

---

## 11. Priority Action Items

1. **P0** - Fix RSVPManager state duplication (Issue #1)
2. **P0** - Remove unused loading state (Issue #2)
3. **P1** - Add granular loading states (Issue #3)
4. **P1** - Consider React Query for server state (Issue #4)
5. **P2** - Add wedding ID to URL (Issue #8)
6. **P2** - Add form validation library (Issue #9)
7. **P3** - Implement optimistic updates (Issue #5)
8. **P3** - Add error boundaries (Issue #10)
