import type { UseQueryOptions, UseQueryResult } from '@tanstack/react-query'
import { Duration } from '@gorgias/toolkit'

import type { BillingState, HttpResponse } from '@gorgias/helpdesk-queries'
import { useGetBillingState } from '@gorgias/helpdesk-queries'

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
            staleTime: Duration.hours(1),
            cacheTime: Duration.minutes(65),
            refetchOnWindowFocus: false,
            ...overrides,
        },
    })

    return { data: data?.data, ...rest }
}
