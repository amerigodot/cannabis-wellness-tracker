# Technology Stack

## Frontend
- **Framework:** React 18 (TypeScript)
- **Build Tool:** Vite
- **Routing:** React Router DOM
- **State Management:** TanStack Query (React Query)
- **Form Handling:** React Hook Form
- **Validation:** Zod

## UI & Styling
- **CSS Framework:** Tailwind CSS
- **Component Library:** Shadcn UI (Radix UI primitives)
- **Icons:** Lucide React
- **Animations:** tailwindcss-animate, Framer Motion (implied by Radix/Shadcn)
- **Visualization:** Recharts (for clinical and wellness trends)

## Backend & Infrastructure
- **BaaS:** Supabase
  - **Auth:** Email/Password and potentially OAuth
  - **Database:** PostgreSQL with Row Level Security (RLS)
  - **Edge Functions:** Deno-based serverless functions for triage and notifications
  - **Migrations:** SQL-based migrations managed via Supabase CLI

## AI & Machine Learning
- **Edge AI Engine:** WebLLM (`@mlc-ai/web-llm`)
- **Model:** Gemma-2B (quantized for browser execution)
- **Acceleration:** WebGPU (fallback to WASM if unavailable)
- **Pattern:** In-Context Learning (ICL) and Local Retrieval Augmented Generation (RAG)

## Security & Privacy
- **Encryption:** End-to-End Encryption (E2EE) for patient-clinician data sharing
- **Privacy:** Local-only AI inference for PHI protection

## Development & Testing
- **Language:** TypeScript (Strict Mode)
- **Testing:** Vitest
- **Linting:** ESLint (Flat Config)
- **Formatting:** Prettier (standard with Vite/React setups)
