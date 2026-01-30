# Privacy-First Database Architecture Plan

## Status: Core Implementation Complete ✅

---

## ✅ Completed Phases

### Phase 1: Client-Side Encryption Infrastructure ✅

**Created `src/lib/crypto.ts`**:
- PBKDF2 key derivation (100,000 iterations)
- AES-256-GCM encryption/decryption via Web Crypto API
- Session storage for key material
- Password hash verification

### Phase 2: Database Schema Changes ✅

**Migration applied**:
- Created `user_encryption_salts` table with RLS
- Added `encrypted_data` and `encryption_version` columns to `journal_entries`
- Added `privacy_mode_enabled` and `data_migrated_at` to `email_preferences`
- Trigger for auto-updating timestamps

### Phase 3: Data Access Layer Updates ✅

**Created `src/contexts/EncryptionContext.tsx`**:
- Key management React context
- `encrypt`, `decrypt`, `isUnlocked` functions
- Automatic status checking on auth changes
- Key derivation on unlock

**Created `src/hooks/useEncryptedJournal.ts`**:
- Helper hook for journal-specific encryption
- Entry encryption/decryption utilities
- Sensitive field extraction

**Created UI Components**:
- `src/components/UnlockPrompt.tsx` - Password unlock screen
- `src/components/MigrationWizard.tsx` - Encrypt existing data wizard

**Updated Files**:
- `src/App.tsx` - Added EncryptionProvider wrapper
- `src/pages/Index.tsx` - Unlock/migration UI integration
- `src/pages/Settings.tsx` - Privacy settings section

### Phase 4: Migration Wizard ✅

**MigrationWizard component handles**:
- Intro explaining privacy benefits
- Password setup for new encryption
- Background encryption of all existing entries
- Progress indicator during migration
- Completion confirmation

### Phase 5: Privacy Settings ✅

**Settings page now includes**:
- Encryption status display
- Enable encryption button (triggers wizard)
- Lock journal button (for encrypted users)
- Zero-knowledge explanation card

### Phase 6: Update Edge Functions ✅

**Updated `supabase/functions/send-weekly-summary/index.ts`**:
- Removed AI content analysis (cannot read encrypted data)
- Only sends counts: entries this week, total entries, milestone progress
- Privacy mode indicator in emails
- Zero-knowledge server principle maintained

---

## 🔄 Future Enhancements (Phase 7)

### Local-First Enhancements
- IndexedDB for larger offline storage
- Optional encrypted cloud backup sync
- PWA enhancements for full offline operation
- Recovery phrase (BIP39-style mnemonic) option

---

## Architecture Summary

```text
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT BROWSER                           │
├─────────────────────────────────────────────────────────────────┤
│  User Password + Salt → PBKDF2 (100k iterations) → AES-256 Key  │
│                                                                 │
│  Key stored in SessionStorage (cleared on tab close)            │
├─────────────────────────────────────────────────────────────────┤
│  Create/Update Entry:                                           │
│    Sensitive fields → AES-GCM Encrypt → encrypted_data blob     │
│    → Send to Supabase with placeholder values                   │
├─────────────────────────────────────────────────────────────────┤
│  Fetch Entries:                                                 │
│    Receive encrypted_data → AES-GCM Decrypt → Restore fields    │
│    → Display in UI / Process with Edge AI                       │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      SUPABASE (SERVER)                          │
├─────────────────────────────────────────────────────────────────┤
│  Stores:                                                        │
│    - encrypted_data (opaque blob - unreadable)                  │
│    - id, user_id, timestamps (operational metadata)             │
│    - user_encryption_salts (for key derivation)                 │
│                                                                 │
│  Cannot:                                                        │
│    - Read strain names, dosages, notes, mood scores             │
│    - Analyze patterns or health data                            │
│    - Generate personalized insights                             │
│                                                                 │
│  Weekly emails: Only counts, no content analysis                │
└─────────────────────────────────────────────────────────────────┘
```

---

## Files Created

| File | Purpose |
|------|---------|
| `src/lib/crypto.ts` | Web Crypto API encryption utilities |
| `src/contexts/EncryptionContext.tsx` | React context for key management |
| `src/hooks/useEncryptedJournal.ts` | Journal-specific encryption helpers |
| `src/components/UnlockPrompt.tsx` | UI to unlock encrypted data |
| `src/components/MigrationWizard.tsx` | Migrate existing plaintext data |

## Files Modified

| File | Changes |
|------|---------|
| `src/App.tsx` | Added EncryptionProvider |
| `src/pages/Index.tsx` | Unlock prompt, migration wizard integration |
| `src/pages/Settings.tsx` | Privacy & Encryption settings section |
| `supabase/functions/send-weekly-summary/index.ts` | Zero-knowledge email (counts only) |

## Database Changes

| Change | Status |
|--------|--------|
| `user_encryption_salts` table | ✅ Created |
| `journal_entries.encrypted_data` | ✅ Added |
| `journal_entries.encryption_version` | ✅ Added |
| `email_preferences.privacy_mode_enabled` | ✅ Added |
| `email_preferences.data_migrated_at` | ✅ Added |

---

## Security Features

1. **Key derivation**: PBKDF2 with 100,000 iterations, random salt per user
2. **Encryption**: AES-256-GCM (authenticated encryption)
3. **Key storage**: SessionStorage only (cleared on browser close)
4. **Salt storage**: Random per-user salt stored server-side
5. **No key escrow**: Server never sees encryption key
6. **Zero-knowledge backend**: Server stores only encrypted blobs

---

## User Experience

### New Users
- Can enable encryption from Settings
- Clear explanation of privacy benefits
- Warning about password recovery

### Existing Users
- Prompted to enable encryption on dashboard
- One-time migration process
- All existing entries encrypted in background

### Encrypted Users
- Must enter password to unlock journal
- Lock button in settings for manual locking
- Session cleared on tab/browser close
