import type { UseQueryOptions } from '@tanstack/react-query'
import { useQuery } from '@tanstack/react-query'

import type { JourneyTypeEnum } from '@gorgias/convert-client'
import { getAllJourneysPublic } from '@gorgias/convert-client'

import { getGorgiasRevenueAddonApiBaseUrl } from 'rest_api/revenue_addon_api/client'

import { aiJourneyKeys } from '../utils'

const fetchJourneys = async (
    integrationId: number,
    types: JourneyTypeEnum[],
) => {
    return getAllJourneysPublic(
        { integration_id: integrationId, types },
        {
            baseURL: getGorgiasRevenueAddonApiBaseUrl(),
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
    return useQuery({
        queryKey: aiJourneyKeys.journeys(integrationId, types),
        queryFn: () => fetchJourneys(integrationId!, types),
        enabled: !!integrationId && options.enabled !== false,
        refetchOnWindowFocus: false,
        staleTime: Infinity,
        ...options,
    })
}
