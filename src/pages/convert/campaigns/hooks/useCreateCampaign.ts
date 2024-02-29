import {useQueryClient} from '@tanstack/react-query'
import {useCreateCampaign as usePureCreateCampaign} from 'models/convert/campaign/queries'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import useAppDispatch from 'hooks/useAppDispatch'
import {invalidateCacheOnCampaignChange} from 'pages/convert/campaigns/hooks/utils'
import {Campaign} from 'models/convert/campaign/types'

export const useCreateCampaign = (channelConnectionId: string) => {
    const dispatch = useAppDispatch()
    const queryClient = useQueryClient()

    return usePureCreateCampaign({
        onSuccess: (data) => {
            return invalidateCacheOnCampaignChange(
                queryClient,
                channelConnectionId,
                (data as unknown as Campaign).id
            )
        },
        onError: () =>
            void dispatch(
                notify({
                    status: NotificationStatus.Error,
                    message: 'Failed to create the campaign',
                })
            ),
    })
}
