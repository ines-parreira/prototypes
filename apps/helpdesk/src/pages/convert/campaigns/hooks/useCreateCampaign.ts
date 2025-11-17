import { useQueryClient } from '@tanstack/react-query'

import useAppDispatch from 'hooks/useAppDispatch'
import { useCreateCampaign as usePureCreateCampaign } from 'models/convert/campaign/queries'
import type { Campaign } from 'models/convert/campaign/types'
import { invalidateCacheOnCampaignChange } from 'pages/convert/campaigns/hooks/utils'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

export const useCreateCampaign = () => {
    const dispatch = useAppDispatch()
    const queryClient = useQueryClient()

    return usePureCreateCampaign({
        onSuccess: (data) => {
            void dispatch(
                notify({
                    status: NotificationStatus.Success,
                    message: 'Campaign successfully created',
                }),
            )
            return invalidateCacheOnCampaignChange(
                queryClient,
                (data as unknown as Campaign).id,
            )
        },
        onError: () =>
            void dispatch(
                notify({
                    status: NotificationStatus.Error,
                    message: 'Failed to create the campaign',
                }),
            ),
    })
}
