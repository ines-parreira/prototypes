import { useQueryClient } from '@tanstack/react-query'

import useAppDispatch from 'hooks/useAppDispatch'
import { useStartABGroup as usePureStartABGroup } from 'models/convert/abVariants/queries'
import { invalidateCacheOnCampaignChange } from 'pages/convert/campaigns/hooks/utils'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

export const useStartABGroup = () => {
    const dispatch = useAppDispatch()
    const queryClient = useQueryClient()

    return usePureStartABGroup({
        onSuccess: (_, [, params]) => {
            void dispatch(
                notify({
                    status: NotificationStatus.Success,
                    message: 'A/B test started',
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
                    message: 'Failed to start A/B test',
                }),
            ),
    })
}
