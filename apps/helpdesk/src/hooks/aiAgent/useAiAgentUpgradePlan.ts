import useAppSelector from 'hooks/useAppSelector'
import { useGetAiAgentUpgradePlan } from 'models/aiAgent/queries'
import { getAvailablePlansMapByPlanId } from 'state/billing/selectors'

/**
 * Hook to get AI Agent upgrade plan data from backend
 * @param accountDomain - The account domain to fetch the upgrade plan for
 * @param enabled - Whether the query should be enabled (default: true)
 * @returns Object with upgrade plan data and loading state
 */
const useAiAgentUpgradePlan = (
    accountDomain: string,
    enabled: boolean = true,
) => {
    const plansMap = useAppSelector(getAvailablePlansMapByPlanId)

    const aiAgentUpgradePlanQuery = useGetAiAgentUpgradePlan(accountDomain, {
        enabled: enabled && !!accountDomain,
    })

    const { aiAgentUpgradePlanId } = aiAgentUpgradePlanQuery.data ?? {}

    if (!aiAgentUpgradePlanId) {
        return {
            data: null,
            isLoading: false,
        }
    }
    const upgradePlanData = plansMap[aiAgentUpgradePlanId || '']
    if (!upgradePlanData) {
        return {
            data: null,
            isLoading: aiAgentUpgradePlanQuery.isLoading,
        }
    }

    return {
        data: upgradePlanData,
        isLoading: aiAgentUpgradePlanQuery.isLoading,
    }
}

export { useAiAgentUpgradePlan }
