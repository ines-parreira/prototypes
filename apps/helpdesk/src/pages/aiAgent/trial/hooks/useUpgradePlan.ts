import { toast } from '@gorgias/axiom'

import { useUpgradeAiAgentSubscriptionGeneration6Plan } from 'models/billing/queries'

export const useUpgradePlan = () => {
    const upgradePlanMutation = useUpgradeAiAgentSubscriptionGeneration6Plan({
        onSuccess: () => {
            toast.success('Your plan has been upgraded!')
            window.location.reload()
        },
        onError: () => {
            toast.error('Failed to upgrade plan. Please try again later.')
        },
    })

    return {
        upgradePlan: () => upgradePlanMutation.mutate([]),
        upgradePlanAsync: () => upgradePlanMutation.mutateAsync([]),
        isLoading: upgradePlanMutation.isLoading,
        error: upgradePlanMutation.error,
        isSuccess: upgradePlanMutation.isSuccess,
        isError: upgradePlanMutation.isError,
    }
}
