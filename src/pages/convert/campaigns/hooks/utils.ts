import {QueryClient} from '@tanstack/react-query'
import {campaignKeys} from 'models/convert/campaign/queries'

export const invalidateCacheOnCampaignChange = (
    queryClient: QueryClient,
    channelConnectionId: string,
    campaignId: string
) => {
    return Promise.all([
        queryClient.invalidateQueries({
            queryKey: campaignKeys.list({
                channelConnectionId: channelConnectionId,
            }),
        }),
        queryClient.invalidateQueries({
            queryKey: campaignKeys.detail({
                campaign_id: campaignId,
            }),
        }),
    ])
}
