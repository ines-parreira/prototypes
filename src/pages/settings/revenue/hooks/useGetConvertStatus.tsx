import {useQuery} from '@tanstack/react-query'
import {useIsConvertSubscriber} from 'pages/common/hooks/useIsConvertSubscriber'
import {RevenueAddonClient} from 'rest_api/revenue_addon_api/client'
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
    client: RevenueAddonClient | undefined
) => {
    if (!client) return null
    const res = await client.get_status_and_usage()

    return res.data
}

const useGetConvertStatus = () => {
    const isConvertSubscriber = useIsConvertSubscriber()
    const {client} = useRevenueAddonApi()

    const {data} = useQuery({
        queryKey: ['convert', 'status'],
        queryFn: async () => getConvertStatusAndUsage(client),
        // avoid fetching if not convert subscriber
        enabled: !!client && isConvertSubscriber,
        ...defaultOptions,
    })

    return data
}
export default useGetConvertStatus
