# Cannabis Wellness Tracker → Medical Dashboard
## Implementation Plan: Edge AI Clinical Decision Support System

**Version:** 1.0  
**Date:** February 2026  
**Target:** Transform patient-only wellness tracker into dual-interface clinical platform

---

## Executive Summary

This plan outlines the migration from a privacy-first patient wellness tracker to a **shared decision-support medical dashboard** where clinicians access structured patient journals and guideline-grounded insights while preserving edge AI privacy architecture. The system maintains zero-knowledge data sovereignty while enabling professional oversight of cannabis treatment trajectories.

**Core Innovation:** Bidirectional edge AI that pre-processes patient data locally, generates clinician-ready summaries with RAG-backed recommendations, and synchronizes care plans—all without centralizing raw PHI.

**Timeline:** 16 weeks (4 months)  
**Team:** 2 frontend, 1 backend, 1 ML/AI, 1 clinical advisor, 1 security/privacy engineer

---

## Phase 1: Foundation & Data Model Evolution (Weeks 1-4)

### 1.1 Patient Card Schema Design

**Goal:** Define the central clinical object that replaces simple journal entries.

**Tasks:**
- [x] Design `PatientCard` data structure
- [x] Extend existing journal schema with validated scales
- [x] Add consent layer: per-field permissions

**Deliverables:**
- [x] TypeScript interfaces for patient card (`src/types/patient.ts`)
- [x] Database migration scripts (`supabase/migrations/20260202000000_clinician_linking.sql`)
- [x] Updated local storage schema (Zod schemas in `src/schemas/patient.ts`)

---

### 1.2 Authentication & Account System

**Goal:** Enable secure patient-clinician linking with SSO support.

**Tasks:**
- [x] Implement patient account creation (Existing Auth.tsx)
- [x] Add device fingerprinting for session binding (Supabase Auth)
- [x] Build one-time code generator (`ClinicianLinking.tsx`)
- [x] Create clinician verification flow (`ClinicianAccess.tsx`)
- [x] Design consent modal (`Settings.tsx` integration)

**Deliverables:**
- [x] Auth module with patient/clinician roles
- [x] Linking flow UI (patient generates code, clinician enters)
- [x] Consent management interface

---

## Phase 2: Edge AI Analysis Pipeline (Weeks 5-8)

### 2.1 Local Feature Engineering

**Goal:** Pre-compute clinically relevant features from raw journals on patient device.

**Tasks:**
- [x] Implement dose-response curve fitting (simple linear/logistic)
- [x] Add symptom trajectory analysis (moving averages, trend detection)
- [x] Build adverse event classifier (severity scoring)
- [x] Create LRCUG rule engine (dose thresholds, frequency limits) [8]
- [x] Generate "notable events" timeline (ER visits, panic attacks, dose changes)

**Deliverables:**
- [x] Clinical feature computation library (`src/utils/clinicalAugmentation.ts`)
- [x] Real-time dashboard preview for patients ("Your trends")
- [x] JSON export format for clinician dashboard

---

### 2.2 Pre-Visit Summary Generation with Gemma/MedGemma

**Goal:** Use local LLM to turn metrics into readable clinical narrative.

**Tasks:**
- [x] Integrate Gemma-2B or MedGemma text model in WebLLM (`useClinicalSummarizer.ts`)
- [x] Build prompt templates for different visit types (follow-up, urgent, routine)
- [x] Add guideline citation extraction from RAG context
- [x] Create fallback logic if model unavailable (template-based summary)

**Deliverables:**
- [x] Visit summary generator module
- [x] Unit tests with sample patient data
- [x] Performance benchmarks (inference time, token count)

---

## Phase 3: Clinician Dashboard (Weeks 9-12)

### 3.1 Dashboard UI/UX Design

**Goal:** Create intuitive, timeline-focused interface for busy clinicians.

**Tasks:**
- [x] Wireframe all views (Figma or similar)
- [x] Implement responsive dashboard (React + Tailwind or Chakra UI)
- [x] Build interactive timeline component (Recharts)
- [x] Add guideline citation popovers (hover over risk flag → shows LRCUG excerpt)
- [x] Create plan editor form with real-time validation

**Deliverables:**
- [x] High-fidelity mockups (5 key screens)
- [x] React dashboard prototype (read-only data)
- [x] Plan editor with validation logic

---

### 3.2 Data Synchronization Architecture

**Goal:** Enable secure, patient-controlled data sharing without centralizing raw journals.

**Tasks:**
- [x] Implement end-to-end encryption layer (libsodium.js or similar logic)
- [x] Build lightweight sync API (REST or WebSocket)
- [x] Add key management UI (patient exports public key QR for clinician)
- [x] Implement offline queueing (patient can generate summaries offline, sync when online)
- [x] Create audit log viewer (patient can see who accessed what, when)

**Deliverables:**
- [x] Sync server API (2 endpoints: upload, fetch)
- [x] Encryption module with key exchange protocol
- [x] Audit log viewer UI

---

## Phase 4: Integration & Pilot (Weeks 13-16)
