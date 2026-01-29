
# Privacy-First Database Architecture Plan

## Overview
This plan transforms the Medical Marijuana Journal into a true privacy-first application where users maintain control over their sensitive health data. The core principle: **the server stores encrypted data it cannot read, and all AI/analytics processing happens client-side**.

---

## Current State Analysis

### What Exists Today
1. **Server-stored plaintext data**: Journal entries (strains, dosages, mood scores, symptoms, notes) stored unencrypted in Supabase
2. **Server-side processing**: Weekly summary edge function reads user entries and sends them to AI for analysis
3. **RLS protection**: Good row-level security ensures users only access their own data
4. **Demo mode**: Already supports local-only operation with localStorage

### Privacy Gaps
- Backend administrators or database breaches could expose sensitive health information
- Server-side AI processing requires sending plaintext data to external services
- No way for users to verify their data remains private
- Email notifications contain personalized health insights generated from raw data

---

## Privacy-First Architecture

### Core Principles
1. **Client-side encryption**: All sensitive journal data encrypted before leaving the browser
2. **User-controlled keys**: Encryption keys derived from user's password, never stored on server
3. **Zero-knowledge server**: Backend only stores encrypted blobs, cannot decrypt
4. **Client-side analytics**: All AI insights and charts generated locally using on-device models (already have Edge Wellness Coach)
5. **Minimal metadata**: Only necessary operational data (timestamps, user_id) stored unencrypted

---

## Implementation Plan

### Phase 1: Client-Side Encryption Infrastructure

**Create encryption utilities** (`src/lib/crypto.ts`):
- Derive encryption key from user password using PBKDF2
- Store derived key in sessionStorage (cleared on logout)
- Use AES-GCM for symmetric encryption via Web Crypto API
- Implement encrypt/decrypt functions for journal entry fields

```text
User Password → PBKDF2 (100,000 iterations) → 256-bit AES Key → Session Storage
                    ↓
        Salt stored in encrypted_profiles table (per-user, random)
```

**Sensitive fields to encrypt**:
- `strain`, `strain_2` (product names)
- `notes`, `before_notes` (free-text health observations)
- `observations[]`, `activities[]`, `negative_side_effects[]` (health tags)
- `dosage` (consumption amounts)

**Fields kept unencrypted** (for basic server operations):
- `id`, `user_id`, `created_at`, `consumption_time` (timestamps for sync)
- `is_deleted`, `entry_status` (soft delete, workflow status)
- Numeric mood scores (encrypted separately, discussed below)

### Phase 2: Database Schema Changes

**Migration: Create encryption metadata table**:
```sql
CREATE TABLE public.user_encryption_salts (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  password_salt TEXT NOT NULL,
  key_version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

ALTER TABLE public.user_encryption_salts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own encryption salt"
  ON public.user_encryption_salts
  FOR ALL
  USING (auth.uid() = user_id);
```

**Migration: Add encrypted fields to journal_entries**:
```sql
ALTER TABLE public.journal_entries
  ADD COLUMN encrypted_data TEXT,
  ADD COLUMN encryption_version INTEGER DEFAULT 1;
```

The `encrypted_data` column stores a JSON blob containing all sensitive fields, encrypted client-side.

### Phase 3: Data Access Layer Updates

**Update `useInfiniteJournalEntries.ts`**:
- On fetch: Decrypt `encrypted_data` before returning entries
- On create/update: Encrypt sensitive fields into `encrypted_data` before sending
- Handle key unavailability gracefully (redirect to unlock)

**Create encryption context** (`src/contexts/EncryptionContext.tsx`):
- Store derived key in React context
- Provide `encrypt`, `decrypt`, `isUnlocked` functions
- Handle key derivation on login
- Clear key on logout

**Update auth flow** (`src/pages/Auth.tsx`):
- After successful login, derive encryption key from password
- Store key in session (not localStorage for security)
- Salt fetched from `user_encryption_salts` table

### Phase 4: Migrate Existing Data

**Create migration utility**:
- One-time migration screen for existing users
- Re-prompts for password to derive key
- Encrypts all existing plaintext entries
- Updates entries with `encrypted_data` field
- Marks migration complete in user profile

### Phase 5: Privacy Mode Options

**Add privacy settings** (`src/pages/Settings.tsx`):
- Toggle: "Privacy Mode" (client-side encryption enabled)
- Toggle: "Full Offline Mode" (no server sync, all localStorage)
- Export encryption key backup (for recovery)
- Data portability: Download encrypted backup + key

### Phase 6: Update Edge Functions

**Weekly Summary changes**:
- Cannot read encrypted data; remove AI-generated insights from emails
- Only send milestone counts (no content): "You logged 5 entries this week"
- Option: Disable email entirely for privacy-conscious users

**Triage Assessment changes**:
- Already requires user to input data manually (not reading from DB)
- Continue as-is; user controls what they share

### Phase 7: Local-First Enhancements

**Expand demo mode into full offline-first mode**:
- Use IndexedDB for persistent local storage (larger than localStorage)
- Optional sync: User can enable encrypted cloud backup
- PWA enhancements for offline operation

---

## Technical Implementation Details

### Encryption Flow Diagram
```text
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT BROWSER                           │
├─────────────────────────────────────────────────────────────────┤
│  User Login                                                     │
│      ↓                                                          │
│  Password + Salt → PBKDF2 → Encryption Key                      │
│      ↓                                                          │
│  Key stored in SessionStorage (cleared on tab close)            │
├─────────────────────────────────────────────────────────────────┤
│  Create Journal Entry                                           │
│      ↓                                                          │
│  Sensitive fields → AES-GCM Encrypt → encrypted_data blob       │
│      ↓                                                          │
│  Entry with encrypted_data sent to Supabase                     │
├─────────────────────────────────────────────────────────────────┤
│  Fetch Journal Entries                                          │
│      ↓                                                          │
│  Receive encrypted_data from Supabase                           │
│      ↓                                                          │
│  AES-GCM Decrypt → Original sensitive fields                    │
│      ↓                                                          │
│  Display in UI / Process with Edge AI                           │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      SUPABASE (SERVER)                          │
├─────────────────────────────────────────────────────────────────┤
│  journal_entries table:                                         │
│    - id, user_id, created_at (unencrypted - operational)        │
│    - encrypted_data (encrypted blob - cannot read)              │
│    - encryption_version (for key rotation support)              │
│                                                                 │
│  Server can only:                                               │
│    - Store/retrieve encrypted blobs                             │
│    - Count entries (for milestones)                             │
│    - Filter by timestamp                                        │
│  Server CANNOT:                                                 │
│    - Read strain names, dosages, notes                          │
│    - Analyze patterns or health data                            │
│    - Generate personalized insights                             │
└─────────────────────────────────────────────────────────────────┘
```

### Files to Create

| File | Purpose |
|------|---------|
| `src/lib/crypto.ts` | Web Crypto API encryption utilities |
| `src/contexts/EncryptionContext.tsx` | React context for key management |
| `src/components/UnlockPrompt.tsx` | UI to unlock encrypted data |
| `src/components/MigrationWizard.tsx` | Migrate existing plaintext data |
| `src/pages/PrivacySettings.tsx` | Privacy mode configuration |

### Files to Modify

| File | Changes |
|------|---------|
| `src/hooks/useInfiniteJournalEntries.ts` | Add encrypt/decrypt layer |
| `src/hooks/useJournalEntries.ts` | Integrate encryption context |
| `src/pages/Auth.tsx` | Derive key on login |
| `src/pages/Settings.tsx` | Add privacy toggles |
| `src/components/dashboard/JournalEntryForm.tsx` | Encrypt before submit |
| `supabase/functions/send-weekly-summary/index.ts` | Remove data reading |

### Database Migrations

1. Create `user_encryption_salts` table with RLS
2. Add `encrypted_data` and `encryption_version` columns to `journal_entries`
3. Add `privacy_mode_enabled` to `email_preferences` or create new preferences table

---

## User Experience Considerations

### Onboarding for New Users
- Default to privacy mode ON for new signups
- Clear explanation: "Your journal data is encrypted with your password"
- Warning: "If you forget your password, encrypted data cannot be recovered"

### Existing User Migration
- Gentle prompt: "Enable enhanced privacy protection?"
- One-time password re-entry to derive key
- Background migration of existing entries
- Progress indicator for large journals

### Key Recovery
- Option to export encrypted key backup file
- Recovery phrase option (BIP39-style mnemonic)
- Clear warning about unrecoverable data if key lost

---

## Security Considerations

1. **Key derivation**: PBKDF2 with 100,000+ iterations, random salt per user
2. **Encryption**: AES-256-GCM (authenticated encryption)
3. **Key storage**: SessionStorage only (cleared on browser close, not persistent)
4. **Salt storage**: Random per-user salt stored server-side (public, not secret)
5. **No key escrow**: Server never sees encryption key

---

## Summary of Changes

| Component | Before | After |
|-----------|--------|-------|
| Journal data | Plaintext in database | Encrypted blob |
| AI analysis | Server-side (edge functions) | Client-side (Edge AI) |
| Weekly emails | Personalized insights | Counts only |
| Key management | N/A | User password-derived |
| Offline mode | Demo mode only | Full offline-first option |
| Data portability | JSON/CSV export | Encrypted backup + key |

This architecture ensures that even if the database is compromised, user health data remains unreadable without the user's password-derived key.
