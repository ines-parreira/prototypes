import type { UseQueryOptions } from '@tanstack/react-query'
import { useQuery } from '@tanstack/react-query'

import { listSegments } from '@gorgias/customer-segmentation-client'
import type { ListSegmentsParams } from '@gorgias/customer-segmentation-types'

import { aiJourneyKeys } from '../utils'

const fetchSegments = async (
    integrationId: number,
    params?: Omit<ListSegmentsParams, 'integration_id'>,
) => {
    return listSegments({ ...params, integration_id: integrationId }).then(
        (res) => res.data,
    )
}

export const useSegments = <TData = Awaited<ReturnType<typeof fetchSegments>>>(
    integrationId: number | undefined,
    params?: Omit<ListSegmentsParams, 'integration_id'>,
    options: UseQueryOptions<
        Awaited<ReturnType<typeof fetchSegments>>,
        unknown,
        TData
    > = {},
) => {
    return useQuery({
        queryKey: aiJourneyKeys.segments(integrationId, params),
        queryFn: () => fetchSegments(integrationId!, params),
        enabled: integrationId != null && options.enabled !== false,
        refetchOnWindowFocus: false,
        staleTime: Infinity,
        ...options,
    })
}
