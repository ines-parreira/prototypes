import { useMutation } from '@tanstack/react-query'

import useAppDispatch from 'hooks/useAppDispatch'
import { useUpgradeSalesSubscriptionMutation } from 'models/aiAgent/queries'
import { useActivation } from 'pages/aiAgent/Activation/hooks/useActivation'
import { useSalesTrialRevampMilestone } from 'pages/aiAgent/trial/hooks/useSalesTrialRevampMilestone'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

export const useUpgradePlan = () => {
    const { onUpgradePlanClick } = useActivation()
    const trialMilestone = useSalesTrialRevampMilestone()
    const dispatch = useAppDispatch()

    const isRevampTrialMilestone1Enabled = trialMilestone === 'milestone-1'

    const upgradeSalesSubscriptionMutation =
        useUpgradeSalesSubscriptionMutation()

    const upgradePlanMutation = useMutation({
        mutationFn: () => {
            if (isRevampTrialMilestone1Enabled) {
                return upgradeSalesSubscriptionMutation.mutateAsync([])
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
                    message: 'Failed to upgrade plan. Please try again later.',
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
