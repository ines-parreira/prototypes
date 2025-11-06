import { useQuery, UseQueryOptions } from '@tanstack/react-query'

import { getAudiencesSegments } from '@gorgias/convert-client'

import { useAccessToken } from 'AIJourney/providers/TokenProvider/TokenProvider'
import { getGorgiasRevenueAddonApiBaseUrl } from 'rest_api/revenue_addon_api/client'

const fetchAudienceSegments = async (
    integrationId: number,
    accessToken: string,
    search?: string,
) => {
    return getAudiencesSegments(
        { store_integration_id: integrationId, search },
        {
            baseURL: getGorgiasRevenueAddonApiBaseUrl(),
            headers: { Authorization: accessToken },
        },
    ).then((res) => res.data)
}

export const useAudienceSegments = <
    TData = Awaited<ReturnType<typeof fetchAudienceSegments>>,
>(
    integrationId: number | undefined,
    search?: string,
    options: UseQueryOptions<
        Awaited<ReturnType<typeof fetchAudienceSegments>>,
        unknown,
        TData
    > = {},
) => {
    const accessToken = useAccessToken()
    return useQuery({
        queryKey: ['audience-segments', integrationId, search],
        queryFn: () =>
            fetchAudienceSegments(integrationId!, accessToken!, search),
        enabled: !!accessToken && !!integrationId && options.enabled !== false,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        staleTime: Infinity,
        ...options,
    })
}
