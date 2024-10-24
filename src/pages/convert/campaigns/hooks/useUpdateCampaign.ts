import {useQueryClient} from '@tanstack/react-query'

import useAppDispatch from 'hooks/useAppDispatch'
import {useUpdateCampaign as usePureUpdateCampaign} from 'models/convert/campaign/queries'
import {invalidateCacheOnCampaignChange} from 'pages/convert/campaigns/hooks/utils'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'

export const useUpdateCampaign = () => {
    const dispatch = useAppDispatch()
    const queryClient = useQueryClient()

    return usePureUpdateCampaign({
        onSuccess: (_, [, params]) => {
            void dispatch(
                notify({
                    status: NotificationStatus.Success,
                    message: 'Campaign successfully updated',
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
                    message: 'Failed to update the campaign',
                })
            ),
    })
}
