import type { ChecklistTask } from '@repo/onboarding'

export type UseOnboardingChecklistOptions = {
    /**
     * Gates data fetching. When false the hook does no work and returns no
     * steps; wire this to the future query's `enabled` option so the progress
     * endpoint is never hit for users outside the onboarding experience.
     */
    enabled?: boolean
}

export type UseOnboardingChecklistResult = {
    tasks: ChecklistTask[]
    title: string
}

// TODO(CRMGROW-3810): replace the placeholder with the canonical onboarding
// progress endpoint (rest-api-sdk hook) and map its steps to ChecklistTask[].
// The endpoint is the single source of truth for step completion; this card
// only reflects it. Pass `enabled` through to the query's `enabled` option so
// the fetch is skipped for gated-out users. Keep the return shape stable so the
// swap is a one-liner.
const PLACEHOLDER_TASKS: ChecklistTask[] = [
    { content: 'Review tone of voice and knowledge', status: 'completed' },
    { content: 'Connect e-commerce platform', status: 'completed' },
    { content: 'Configure skills', status: 'completed' },
    { content: 'Connect support channel(s)', status: 'pending' },
]

/**
 * Typed seam for the onboarding checklist data. Until the progress endpoint
 * lands (CRMGROW-3810) this returns static placeholder steps so the card can
 * be developed and reviewed; the consuming surface and the flag gate are
 * already wired around it.
 */
export function useOnboardingChecklist({
    enabled = true,
}: UseOnboardingChecklistOptions = {}): UseOnboardingChecklistResult {
    return { tasks: enabled ? PLACEHOLDER_TASKS : [], title: 'Get started' }
}
