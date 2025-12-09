import type { UseQueryOptions } from '@tanstack/react-query'
import { useQuery } from '@tanstack/react-query'

import { getAudiencesSegments } from '@gorgias/convert-client'

import { getGorgiasRevenueAddonApiBaseUrl } from 'rest_api/revenue_addon_api/client'

const fetchAudienceSegments = async (
    integrationId: number,
    search?: string,
) => {
    return getAudiencesSegments(
        { store_integration_id: integrationId, search },
        {
            baseURL: getGorgiasRevenueAddonApiBaseUrl(),
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
    return useQuery({
        queryKey: ['audience-segments', integrationId, search],
        queryFn: () => fetchAudienceSegments(integrationId!, search),
        enabled: !!integrationId && options.enabled !== false,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        staleTime: Infinity,
        ...options,
    })
}
