import { useAiAgentGeneration6Plan } from 'models/billing/queries'

/**
 * Hook to get AI Agent upgrade plan data from backend
 * @param enabled - Whether the query should be enabled (default: true)
 * @returns Object with upgrade plan data and loading state
 */
const useAiAgentUpgradePlan = (enabled: boolean = true) => {
    const { data, isInitialLoading } = useAiAgentGeneration6Plan({
        enabled,
    })

    if (!data) {
        return { data: null, isLoading: isInitialLoading }
    }

    return {
        data: data.plan,
        isLoading: isInitialLoading,
    }
}

export { useAiAgentUpgradePlan }
