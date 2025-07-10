import { useMutation } from '@tanstack/react-query'

import useAppDispatch from 'hooks/useAppDispatch'
import { useActivation } from 'pages/aiAgent/Activation/hooks/useActivation'
import { useSalesTrialRevampMilestone } from 'pages/aiAgent/trial/hooks/useSalesTrialRevampMilestone'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

export const useUpgradePlan = () => {
    const { onUpgradePlanClick } = useActivation()
    const trialMilestone = useSalesTrialRevampMilestone()
    const dispatch = useAppDispatch()

    const isRevampTrialMilestone1Enabled = trialMilestone === 'milestone-1'

    const upgradePlanMutation = useMutation({
        mutationFn: async () => {
            if (isRevampTrialMilestone1Enabled) {
                // TODO: Implement the new upgrade plan logic
                // For now, simulate loading with a delay
                await new Promise((resolve) => setTimeout(resolve, 1500))
                alert(
                    'The upgrade API is not connected yet. It will be by the end of the week.',
                )
                return Promise.resolve()
            }
            return onUpgradePlanClick()
        },
        onSuccess: () => {
            void dispatch(
                notify({
                    message:
                        'Plan upgraded! Watch Shopping Assistant turn visitors into buyers.',
                    status: NotificationStatus.Success,
                }),
            )
        },
        onError: () => {
            void dispatch(
                notify({
                    message: 'Failed to upgrade plan. Please try again.',
                    status: NotificationStatus.Error,
                }),
            )
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
