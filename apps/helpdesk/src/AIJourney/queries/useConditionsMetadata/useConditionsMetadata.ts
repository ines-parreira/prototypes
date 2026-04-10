import type { UseQueryOptions } from '@tanstack/react-query'
import { useQuery } from '@tanstack/react-query'

import { getConditionsMetadata } from '@gorgias/customer-segmentation-client'
import type { ConditionsMetadata } from '@gorgias/customer-segmentation-types'

import { aiJourneyKeys } from '../utils'

const fetchConditionsMetadata = async () => {
    return getConditionsMetadata().then((res) => res.data)
}

export const useConditionsMetadata = <TData = ConditionsMetadata>(
    options: UseQueryOptions<ConditionsMetadata, unknown, TData> = {},
) => {
    return useQuery({
        queryKey: aiJourneyKeys.conditionsMetadata(),
        queryFn: fetchConditionsMetadata,
        refetchOnWindowFocus: false,
        staleTime: Infinity,
        ...options,
    })
}
