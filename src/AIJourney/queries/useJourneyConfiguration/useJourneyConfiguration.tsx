import { useQuery } from '@tanstack/react-query'

import { getJourneyDetails } from '@gorgias/convert-client'

import { useAccessToken } from 'AIJourney/providers'
import { getGorgiasRevenueAddonApiBaseUrl } from 'rest_api/revenue_addon_api/client'

import { aiJourneyKeys } from '../utils'

const getJourneyConfiguration = async (
    journeyId: string,
    accessToken: string,
) => {
    if (!journeyId || !accessToken) {
        throw new Error(
            `Journey ID and access token are required.\n journeyId: ${journeyId} \n accessToken: ${accessToken}`,
        )
    }

    return getJourneyDetails(journeyId, {
        baseURL: getGorgiasRevenueAddonApiBaseUrl(),
        headers: { Authorization: accessToken },
    }).then((res) => res.data.configuration)
}

export const useJourneyConfiguration = (
    journeyId: string | undefined,
    options: { enabled?: boolean } = {},
) => {
    const accessToken = useAccessToken()
    return useQuery({
        queryKey: aiJourneyKeys.journeyConfiguration(journeyId),
        queryFn: () => getJourneyConfiguration(journeyId!, accessToken!),
        enabled: !!accessToken && !!journeyId && options.enabled !== false,
        refetchOnWindowFocus: false,
        refetchOnMount: true,
        ...options,
    })
}
