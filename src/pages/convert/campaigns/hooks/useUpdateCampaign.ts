import {useQueryClient} from '@tanstack/react-query'
import {useUpdateCampaign as usePureUpdateCampaign} from 'models/convert/campaign/queries'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import useAppDispatch from 'hooks/useAppDispatch'
import {invalidateCacheOnCampaignChange} from 'pages/convert/campaigns/hooks/utils'

export const useUpdateCampaign = (channelConnectionId: string) => {
    const dispatch = useAppDispatch()
    const queryClient = useQueryClient()

    return usePureUpdateCampaign({
        onSuccess: (_, [, params]) => {
            return invalidateCacheOnCampaignChange(
                queryClient,
                channelConnectionId,
                params.campaign_id
            )
        },
        onError: () =>
            void dispatch(
                notify({
                    status: NotificationStatus.Error,
                    message: 'Failed to update the campaign',
                })
            ),
    })
}
