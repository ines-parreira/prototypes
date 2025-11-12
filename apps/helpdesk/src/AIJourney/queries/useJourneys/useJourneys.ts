import { useQuery, UseQueryOptions } from '@tanstack/react-query'

import { getAllJourneysPublic, JourneyTypeEnum } from '@gorgias/convert-client'

import { useAccessToken } from 'AIJourney/providers/TokenProvider/TokenProvider'
import { getGorgiasRevenueAddonApiBaseUrl } from 'rest_api/revenue_addon_api/client'

import { aiJourneyKeys } from '../utils'

const fetchJourneys = async (
    integrationId: number,
    accessToken: string,
    types: JourneyTypeEnum[],
) => {
    return getAllJourneysPublic(
        { integration_id: integrationId, types },
        {
            baseURL: getGorgiasRevenueAddonApiBaseUrl(),
            headers: { Authorization: accessToken },
        },
    ).then((res) => res.data)
}

export const useJourneys = <TData = Awaited<ReturnType<typeof fetchJourneys>>>(
    integrationId: number | undefined,
    types: JourneyTypeEnum[],
    options: UseQueryOptions<
        Awaited<ReturnType<typeof fetchJourneys>>,
        unknown,
        TData
    > = {},
) => {
    const accessToken = useAccessToken()
    return useQuery({
        queryKey: aiJourneyKeys.journeys(integrationId, types),
        queryFn: () => fetchJourneys(integrationId!, accessToken!, types),
        enabled: !!accessToken && !!integrationId && options.enabled !== false,
        refetchOnWindowFocus: false,
        staleTime: Infinity,
        ...options,
    })
}
