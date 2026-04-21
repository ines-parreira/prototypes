import type { UseQueryOptions } from '@tanstack/react-query'
import { useQuery } from '@tanstack/react-query'

import { getAudienceCount } from '@gorgias/customer-segmentation-client'
import type {
    AudienceCount,
    GetAudienceCountParams,
} from '@gorgias/customer-segmentation-types'

import { aiJourneyKeys } from '../utils'

const fetchAudienceCount = async (params: GetAudienceCountParams) => {
    return getAudienceCount(params).then((res) => res.data)
}

export const useAudienceCount = <TData = AudienceCount>(
    params: GetAudienceCountParams = {},
    options: UseQueryOptions<AudienceCount, unknown, TData> = {},
) => {
    return useQuery({
        queryKey: aiJourneyKeys.audienceCount(params),
        queryFn: () => fetchAudienceCount(params),
        refetchOnWindowFocus: false,
        ...options,
    })
}
