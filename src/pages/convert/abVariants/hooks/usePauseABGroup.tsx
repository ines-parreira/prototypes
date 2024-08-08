import {useQueryClient} from '@tanstack/react-query'
import {usePauseABGroup as usePurePauseABGroup} from 'models/convert/abVariants/queries'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import useAppDispatch from 'hooks/useAppDispatch'
import {invalidateCacheOnCampaignChange} from 'pages/convert/campaigns/hooks/utils'

export const usePauseABGroup = () => {
    const dispatch = useAppDispatch()
    const queryClient = useQueryClient()

    return usePurePauseABGroup({
        onSuccess: (_, [, params]) => {
            void dispatch(
                notify({
                    status: NotificationStatus.Success,
                    message: 'A/B test paused',
                })
            )
            return invalidateCacheOnCampaignChange(
                queryClient,
                params.campaign_id
            )
        },
        onError: () =>
            void dispatch(
                notify({
                    status: NotificationStatus.Error,
                    message: 'Failed to pause A/B test',
                })
            ),
    })
}
