import type { UseQueryOptions } from '@tanstack/react-query'
import { useQuery } from '@tanstack/react-query'

import type { GetAudiencesUsageParams } from '@gorgias/convert-client'
import { getAudiencesUsage } from '@gorgias/convert-client'

import { aiJourneyKeys } from '../utils'

const fetchAudiencesUsage = async (
    integrationId: number,
    params?: Omit<GetAudiencesUsageParams, 'store_integration_id'>,
) => {
    return getAudiencesUsage({
        ...params,
        store_integration_id: integrationId,
    }).then((res) => res.data)
}

export const useAudiencesUsage = <
    TData = Awaited<ReturnType<typeof fetchAudiencesUsage>>,
>(
    integrationId: number | undefined,
    params?: Omit<GetAudiencesUsageParams, 'store_integration_id'>,
    options: UseQueryOptions<
        Awaited<ReturnType<typeof fetchAudiencesUsage>>,
        unknown,
        TData
    > = {},
) => {
    return useQuery({
        queryKey: aiJourneyKeys.audienceUsage(integrationId, params),
        queryFn: () => fetchAudiencesUsage(integrationId!, params),
        enabled: integrationId != null && options.enabled !== false,
        refetchOnWindowFocus: false,
        staleTime: Infinity,
        ...options,
    })
}
