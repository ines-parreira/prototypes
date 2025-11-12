import { useQuery } from '@tanstack/react-query'

import { getJourneyDetails } from '@gorgias/convert-client'

import { useAccessToken } from 'AIJourney/providers/TokenProvider/TokenProvider'
import { getGorgiasRevenueAddonApiBaseUrl } from 'rest_api/revenue_addon_api/client'

import { aiJourneyKeys } from '../utils'

export const getJourneyData = async (
    journeyId: string,
    accessToken: string,
) => {
    if (!journeyId || !accessToken) {
        throw new Error(
            `Journey ID and access token are required.\n journeyId: ${journeyId} \n accessToken: ${accessToken}`,
        )
    }

    return await getJourneyDetails(journeyId, {
        baseURL: getGorgiasRevenueAddonApiBaseUrl(),
        headers: { Authorization: accessToken },
    }).then((res) => res.data)
}

export const useJourneyData = (
    journeyId: string | undefined,
    options: { enabled?: boolean } = {},
) => {
    const accessToken = useAccessToken()
    return useQuery({
        queryKey: aiJourneyKeys.journeyConfiguration(journeyId),
        queryFn: () => getJourneyData(journeyId!, accessToken!),
        enabled: !!accessToken && !!journeyId && options.enabled !== false,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        staleTime: Infinity,
        ...options,
    })
}
