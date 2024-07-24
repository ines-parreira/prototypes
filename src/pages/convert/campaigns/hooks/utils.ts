import {QueryClient} from '@tanstack/react-query'
import {campaignKeys} from 'models/convert/campaign/queries'

export const invalidateCacheOnCampaignChange = (
    queryClient: QueryClient,
    campaignId: string
) => {
    return Promise.all([
        queryClient.invalidateQueries({
            queryKey: campaignKeys.lists(),
        }),
        queryClient.invalidateQueries({
            queryKey: campaignKeys.detail({
                campaign_id: campaignId,
            }),
        }),
    ])
}
