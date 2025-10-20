import useAppDispatch from 'hooks/useAppDispatch'
import { useUpgradeAiAgentSubscriptionGeneration6Plan } from 'models/billing/queries'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

export const useUpgradePlan = () => {
    const dispatch = useAppDispatch()

    const upgradePlanMutation = useUpgradeAiAgentSubscriptionGeneration6Plan({
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
        upgradePlan: () => upgradePlanMutation.mutate([]),
        upgradePlanAsync: () => upgradePlanMutation.mutateAsync([]),
        isLoading: upgradePlanMutation.isLoading,
        error: upgradePlanMutation.error,
        isSuccess: upgradePlanMutation.isSuccess,
        isError: upgradePlanMutation.isError,
    }
}
