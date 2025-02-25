import { useQueryClient } from '@tanstack/react-query'

import useAppDispatch from 'hooks/useAppDispatch'
import { useStopABGroup as usePureStopABGroup } from 'models/convert/abVariants/queries'
import { invalidateCacheOnCampaignChange } from 'pages/convert/campaigns/hooks/utils'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

export const useStopABGroup = () => {
    const dispatch = useAppDispatch()
    const queryClient = useQueryClient()

    return usePureStopABGroup({
        onSuccess: (_, [, params]) => {
            void dispatch(
                notify({
                    status: NotificationStatus.Success,
                    message: 'A/B test stopped',
                }),
            )
            return invalidateCacheOnCampaignChange(
                queryClient,
                params.campaign_id,
            )
        },
        onError: () =>
            void dispatch(
                notify({
                    status: NotificationStatus.Error,
                    message: 'Failed to stop A/B test',
                }),
            ),
    })
}
