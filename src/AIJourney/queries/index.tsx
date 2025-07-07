import { useQuery } from '@tanstack/react-query'

import { getAllJourneysPublic } from '@gorgias/convert-client'

import { useAccessToken } from 'AIJourney/providers'
import { isProduction, isStaging } from 'utils/environment'

function getGorgiasRevenueAddonApiBaseUrl(): string {
    if (isProduction()) {
        return 'https://gorgias-convert.com'
    }

    if (isStaging()) {
        return 'https://staging.gorgias-convert.com'
    }

    return 'http://acme.gorgias.docker:8095'
}

export const aiJourneyKeys = {
    journeys: (integrationId: number | undefined) => [
        'journeys',
        integrationId,
    ],
}

const fetchJourneys = async (integrationId: number, accessToken: string) => {
    return getAllJourneysPublic(
        { integration_id: integrationId },
        {
            baseURL: getGorgiasRevenueAddonApiBaseUrl(),
            headers: { Authorization: accessToken },
        },
    ).then((res) => res.data)
}

type JourneyQueryOptions = {
    enabled?: boolean
}

export const useJourneys = (
    integrationId: number | undefined,
    options: JourneyQueryOptions = {},
) => {
    const accessToken = useAccessToken()
    return useQuery({
        queryKey: aiJourneyKeys.journeys(integrationId),
        queryFn: () => fetchJourneys(integrationId!, accessToken!),
        enabled: !!accessToken && !!integrationId && options.enabled !== false,
        ...options,
    })
}
