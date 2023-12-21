import {useQuery} from '@tanstack/react-query'
import {useIsConvertSubscriber} from 'pages/common/hooks/useIsConvertSubscriber'
import {RevenueAddonClient} from 'rest_api/revenue_addon_api/client'
import {Components} from 'rest_api/revenue_addon_api/client.generated'
import {useRevenueAddonApi} from './useRevenueAddonApi'

export enum BundleOnboardingStatus {
    INSTALLED = 'installed',
    NOT_INSTALLED = 'not_installed',
}

export enum UsageStatus {
    OK = 'ok',
    LIMIT_REACHED = 'limit-reached',
}

const defaultOptions = {
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
}

export const getConvertStatusAndUsage = async (
    client: RevenueAddonClient | undefined,
    shopIntegrationId?: number
) => {
    if (!client) return null

    const res = await client.get_status_and_usage(
        shopIntegrationId && {
            shop_integration_id: shopIntegrationId,
        }
    )

    if (res.status !== 200) return null

    return res.data as Components.Schemas.SubscriptionUsageAndBundleStatusSchema
}

const useGetConvertStatus = (
    fetchForAll = false,
    shopIntegrationId?: number
) => {
    const isConvertSubscriber = useIsConvertSubscriber()
    const {client} = useRevenueAddonApi()

    const {data} = useQuery({
        queryKey: ['convert', 'status', shopIntegrationId],
        queryFn: async () =>
            getConvertStatusAndUsage(client, shopIntegrationId),
        // avoid fetching if not convert subscriber
        enabled: !!client && (isConvertSubscriber || fetchForAll),
        ...defaultOptions,
    })

    return data
}
export default useGetConvertStatus
