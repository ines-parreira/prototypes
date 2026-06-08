import { FeatureFlagKey, useFlagWithLoading } from '@repo/feature-flags'
import { OnboardingChecklistCard } from '@repo/onboarding'

import { useOnboardingChecklist } from './useOnboardingChecklist'

/**
 * Flag-gated entry point for the native onboarding checklist. Renders nothing
 * until `copilot-onboarding` is on (the card itself renders nothing until it
 * has steps). Mount this on the chosen onboarding surface once placement is
 * decided.
 */
export function OnboardingChecklist() {
    const { value: isEnabled, isLoading: isFlagLoading } = useFlagWithLoading(
        FeatureFlagKey.CopilotOnboarding,
        false,
    )
    const enabled = isEnabled && !isFlagLoading
    const { tasks, title } = useOnboardingChecklist({ enabled })

    if (!enabled) return null

    return <OnboardingChecklistCard tasks={tasks} title={title} />
}
