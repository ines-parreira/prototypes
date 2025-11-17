import type { UseQueryOptions, UseQueryResult } from '@tanstack/react-query'

import type { BillingState, HttpResponse } from '@gorgias/helpdesk-queries'
import { useGetBillingState } from '@gorgias/helpdesk-queries'

const STALE_TIME = 1000 * 60 * 60 // 1h
const CACHE_TIME = 1000 * 60 * 65 // 1h5m

export type ResponseBillingState = Omit<
    UseQueryResult<HttpResponse<BillingState>>,
    'data'
> & {
    data: BillingState | undefined
}

export function useBillingState(
    overrides?: UseQueryOptions<HttpResponse<BillingState>>,
): ResponseBillingState {
    const { data, ...rest } = useGetBillingState({
        query: {
            staleTime: STALE_TIME,
            cacheTime: CACHE_TIME,
            refetchOnWindowFocus: false,
            ...overrides,
        },
    })

    return { data: data?.data, ...rest }
}
