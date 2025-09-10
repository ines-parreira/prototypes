import useAppSelector from 'hooks/useAppSelector'
import { useTrialAccess } from 'pages/aiAgent/trial/hooks/useTrialAccess'
import { getCurrentAutomatePlan } from 'state/billing/selectors'

type AiAgentAcces = { hasAccess: boolean; isLoading: boolean }

/**
 * Hook that determines whether AI Agent features are accessible.
 *
 * - When a shop name is provided, it checks if this specific store currently has an active trial.
 * - Otherwise, it checks if the user has an active trial on any of their stores.
 *
 * @param shopName - Optional shop name parameter to check the trial for a specific store
 * @returns Whether AI Agent features are accessible
 */
export const useAiAgentAccess = (shopName?: string): AiAgentAcces => {
    const automatePlan = useAppSelector(getCurrentAutomatePlan)

    const {
        hasAnyTrialActive,
        hasCurrentStoreTrialActive,
        isLoading: isTrialLoading,
    } = useTrialAccess(shopName)

    if (automatePlan) {
        return { hasAccess: true, isLoading: false }
    }

    const access = (hasAccess: boolean): AiAgentAcces => ({
        hasAccess,
        isLoading: !!isTrialLoading,
    })

    if (shopName) {
        return access(hasCurrentStoreTrialActive)
    }

    if (hasAnyTrialActive) {
        return access(true)
    }

    return access(false)
}
