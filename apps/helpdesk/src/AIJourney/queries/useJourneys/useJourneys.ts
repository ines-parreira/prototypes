import type { UseQueryOptions } from '@tanstack/react-query'
import { useQuery } from '@tanstack/react-query'

import type { JourneyApiDTO, JourneyTypeEnum } from '@gorgias/convert-client'
import { getAllJourneysPublic } from '@gorgias/convert-client'

import { getGorgiasRevenueAddonApiBaseUrl } from 'rest_api/revenue_addon_api/client'

import { aiJourneyKeys } from '../utils'

const fetchJourneys = async (
    integrationId: number,
    types: JourneyTypeEnum[],
) => {
    const res = await getAllJourneysPublic(
        { integration_id: integrationId, types },
        {
            baseURL: getGorgiasRevenueAddonApiBaseUrl(),
        },
    )
    // Handle new JourneyListApiDTO format {built_in: [...], custom: {items: [...]}}
    // introduced in convert-service aijou-1661 alongside the old JourneyApiDTO[] format.
    const data = res.data as unknown as
        | { built_in: JourneyApiDTO[]; custom: { items: JourneyApiDTO[] } }
        | JourneyApiDTO[]
    if (!Array.isArray(data) && 'built_in' in data) {
        return [...(data.built_in ?? []), ...(data.custom?.items ?? [])]
    }
    return data as JourneyApiDTO[]
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
