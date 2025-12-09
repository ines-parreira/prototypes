import { useQuery } from '@tanstack/react-query'

import { getJourneyDetails } from '@gorgias/convert-client'

import { getGorgiasRevenueAddonApiBaseUrl } from 'rest_api/revenue_addon_api/client'

import { aiJourneyKeys } from '../utils'

export const getJourneyData = async (journeyId: string) => {
    if (!journeyId) {
        throw new Error(`Journey ID is required.\n journeyId: ${journeyId}`)
    }

    return await getJourneyDetails(journeyId, {
        baseURL: getGorgiasRevenueAddonApiBaseUrl(),
    }).then((res) => res.data)
}

export const useJourneyData = (
    journeyId: string | undefined,
    options: { enabled?: boolean } = {},
) => {
    return useQuery({
        queryKey: aiJourneyKeys.journeyConfiguration(journeyId),
        queryFn: () => getJourneyData(journeyId!),
        enabled: !!journeyId && options.enabled !== false,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        staleTime: Infinity,
        ...options,
    })
}
