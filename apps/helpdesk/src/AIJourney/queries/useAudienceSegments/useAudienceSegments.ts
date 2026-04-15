import type { UseQueryOptions } from '@tanstack/react-query'
import { useQuery } from '@tanstack/react-query'

import {
    AudienceListSource,
    getAudiencesSegments,
} from '@gorgias/convert-client'

import { getGorgiasRevenueAddonApiBaseUrl } from 'rest_api/revenue_addon_api/client'

export { AudienceListSource }

const fetchAudienceSegments = async (
    integrationId: number,
    source?: AudienceListSource,
    search?: string,
) => {
    return getAudiencesSegments(
        { store_integration_id: integrationId, source, search },
        {
            baseURL: getGorgiasRevenueAddonApiBaseUrl(),
        },
    ).then((res) => res.data)
}

export const useAudienceSegments = <
    TData = Awaited<ReturnType<typeof fetchAudienceSegments>>,
>(
    integrationId: number | undefined,
    source?: AudienceListSource,
    search?: string,
    options: UseQueryOptions<
        Awaited<ReturnType<typeof fetchAudienceSegments>>,
        unknown,
        TData
    > = {},
) => {
    return useQuery({
        queryKey: ['audience-segments', integrationId, source, search],
        queryFn: () => fetchAudienceSegments(integrationId!, source, search),
        enabled: !!integrationId && options.enabled !== false,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        staleTime: Infinity,
        ...options,
    })
}
