# Track Plan: Enhance Edge AI Reasoning

## Phase 1: Feature Engineering & Prompt Refinement [ ]

- [ ] Task: Refine `computeClinicalFeatures` in `src/utils/clinicalAugmentation.ts`
    - [ ] Write unit tests for enhanced metric calculation in `src/utils/clinicalAugmentation.test.ts`
    - [ ] Implement more granular adverse effect tracking.
    - [ ] Refine dosage inference logic to handle more unit types.
    - [ ] Update risk flag logic based on latest clinical protocols.
- [ ] Task: Update Prompt Engineering in `src/hooks/useClinicalSummarizer.ts`
    - [ ] Write unit tests for `useClinicalSummarizer` (mocking MLCEngine).
    - [ ] Integrate structured clinical protocol data into the prompt template.
    - [ ] Enforce strict SOAP format and grounding requirements in the system persona.
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Feature Engineering & Prompt Refinement' (Protocol in workflow.md)

## Phase 2: Grounding & Verification [ ]

- [ ] Task: Implement Grounding Verification Utility
    - [ ] Write unit tests for `src/utils/clinicalGrounding.ts`.
    - [ ] Create `src/utils/clinicalGrounding.ts` to compare LLM output against deterministic metrics.
    - [ ] Integrate the grounding check into the `useClinicalSummarizer` hook.
- [ ] Task: Final Quality Pass & Documentation
    - [ ] Verify 80% code coverage for all new/modified files.
    - [ ] Update `GEMINI.md` with notes on the improved AI reasoning pipeline.
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Grounding & Verification' (Protocol in workflow.md)
