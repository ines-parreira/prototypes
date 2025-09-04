import { FeatureFlagKey } from '@repo/feature-flags'
import { useMutation } from '@tanstack/react-query'

import { useFlag } from 'core/flags'
import useAppDispatch from 'hooks/useAppDispatch'
import {
    useUpgradeSalesSubscriptionMutation,
    useUpgradeSubscriptionMutation,
} from 'models/aiAgent/queries'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

export const useUpgradePlan = () => {
    const dispatch = useAppDispatch()

    const isExpandingTrialExperienceEnabled = useFlag(
        FeatureFlagKey.AiAgentExpandingTrialExperienceForAll,
    )

    const upgradeSalesSubscriptionMutation =
        useUpgradeSalesSubscriptionMutation()

    const upgradeSubscriptionMutation = useUpgradeSubscriptionMutation()

    const upgradePlanMutation = useMutation({
        mutationFn: () => {
            if (isExpandingTrialExperienceEnabled) {
                return upgradeSubscriptionMutation.mutateAsync([])
            }
            return upgradeSalesSubscriptionMutation.mutateAsync([])
        },
        onSuccess: () => {
            void dispatch(
                notify({
                    message: 'Your plan has been upgraded!',
                    status: NotificationStatus.Success,
                }),
            )
            window.location.reload()
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
