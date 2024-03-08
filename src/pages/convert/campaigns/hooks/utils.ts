import {QueryClient} from '@tanstack/react-query'
import {campaignKeys} from 'models/convert/campaign/queries'

export const invalidateCacheOnCampaignChange = (
    queryClient: QueryClient,
    channelConnectionId: string | undefined,
    campaignId: string
) => {
    const queryKeyList = channelConnectionId
        ? campaignKeys.list({channelConnectionId})
        : campaignKeys.lists()

    return Promise.all([
        queryClient.invalidateQueries({
            queryKey: queryKeyList,
        }),
        queryClient.invalidateQueries({
            queryKey: campaignKeys.detail({
                campaign_id: campaignId,
            }),
        }),
    ])
}
