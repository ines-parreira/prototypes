import { useMutation } from '@tanstack/react-query'

import { useActivation } from 'pages/aiAgent/Activation/hooks/useActivation'
import { useSalesTrialRevampMilestone } from 'pages/aiAgent/trial/hooks/useSalesTrialRevampMilestone'

export const useUpgradePlan = () => {
    const { onUpgradePlanClick } = useActivation()
    const trialMilestone = useSalesTrialRevampMilestone()

    const isRevampTrialMilestone1Enabled = trialMilestone === 'milestone-1'

    const upgradePlanMutation = useMutation({
        mutationFn: async () => {
            if (isRevampTrialMilestone1Enabled) {
                // TODO: Implement the new upgrade plan logic
                // For now, simulate loading with a delay
                await new Promise((resolve) => setTimeout(resolve, 1500))
                return Promise.resolve()
            }
            return onUpgradePlanClick()
        },
    })

    return {
        upgradePlan: upgradePlanMutation.mutate,
        upgradePlanAsync: upgradePlanMutation.mutateAsync,
        isLoading: upgradePlanMutation.isLoading,
        error: upgradePlanMutation.error,
        isSuccess: upgradePlanMutation.isSuccess,
        isError: upgradePlanMutation.isError,
    }
}
