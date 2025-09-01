import { useQuery, UseQueryOptions } from '@tanstack/react-query'

import { getAllJourneysPublic } from '@gorgias/convert-client'

import { useAccessToken } from 'AIJourney/providers/TokenProvider/TokenProvider'
import { getGorgiasRevenueAddonApiBaseUrl } from 'rest_api/revenue_addon_api/client'

import { aiJourneyKeys } from '../utils'

const fetchJourneys = async (integrationId: number, accessToken: string) => {
    return getAllJourneysPublic(
        { integration_id: integrationId },
        {
            baseURL: getGorgiasRevenueAddonApiBaseUrl(),
            headers: { Authorization: accessToken },
        },
    ).then((res) => res.data)
}

export const useJourneys = <TData = Awaited<ReturnType<typeof fetchJourneys>>>(
    integrationId: number | undefined,
    options: UseQueryOptions<
        Awaited<ReturnType<typeof fetchJourneys>>,
        unknown,
        TData
    > = {},
) => {
    const accessToken = useAccessToken()
    return useQuery({
        queryKey: aiJourneyKeys.journeys(integrationId),
        queryFn: () => fetchJourneys(integrationId!, accessToken!),
        enabled: !!accessToken && !!integrationId && options.enabled !== false,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        staleTime: Infinity,
        ...options,
    })
}
