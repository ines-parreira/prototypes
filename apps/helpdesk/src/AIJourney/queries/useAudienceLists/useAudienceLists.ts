import type { UseQueryOptions } from '@tanstack/react-query'
import { useQuery } from '@tanstack/react-query'

import { getAudiencesLists } from '@gorgias/convert-client'

import { useAccessToken } from 'AIJourney/providers/TokenProvider/TokenProvider'
import { getGorgiasRevenueAddonApiBaseUrl } from 'rest_api/revenue_addon_api/client'

const fetchAudienceLists = async (
    integrationId: number,
    accessToken: string,
    search?: string,
) => {
    return getAudiencesLists(
        { store_integration_id: integrationId, search },
        {
            baseURL: getGorgiasRevenueAddonApiBaseUrl(),
            headers: { Authorization: accessToken },
        },
    ).then((res) => res.data)
}

export const useAudienceLists = <
    TData = Awaited<ReturnType<typeof fetchAudienceLists>>,
>(
    integrationId: number | undefined,
    search?: string,
    options: UseQueryOptions<
        Awaited<ReturnType<typeof fetchAudienceLists>>,
        unknown,
        TData
    > = {},
) => {
    const accessToken = useAccessToken()
    return useQuery({
        queryKey: ['audience-lists', integrationId, search],
        queryFn: () => fetchAudienceLists(integrationId!, accessToken!, search),
        enabled: !!accessToken && !!integrationId && options.enabled !== false,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        staleTime: Infinity,
        ...options,
    })
}
