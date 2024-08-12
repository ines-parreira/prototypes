import {useQueryClient} from '@tanstack/react-query'
import {useCreateABGroup as usePureCreateABGroup} from 'models/convert/abVariants/queries'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import useAppDispatch from 'hooks/useAppDispatch'
import {invalidateCacheOnCampaignChange} from 'pages/convert/campaigns/hooks/utils'

export const useCreateABGroup = () => {
    const dispatch = useAppDispatch()
    const queryClient = useQueryClient()

    return usePureCreateABGroup({
        onSuccess: (_, [, params]) => {
            void dispatch(
                notify({
                    status: NotificationStatus.Success,
                    message: 'A/B test created',
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
                    message: 'Failed to create A/B test',
                })
            ),
    })
}
