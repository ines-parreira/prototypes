import type { UseQueryOptions } from '@tanstack/react-query'
import { Duration } from '@gorgias/toolkit'

import type { getCustomer } from '@gorgias/helpdesk-client'
import type {
    GetCustomerParams,
    HttpError,
    HttpRequestConfig,
} from '@gorgias/helpdesk-queries'
import { useGetCustomer as useGeneratedGetCustomer } from '@gorgias/helpdesk-queries'

export const GET_CUSTOMER_STALE_TIME_MS = Duration.hours(1)

export function useGetCustomer<
    TData = Awaited<ReturnType<typeof getCustomer>>,
    TError = HttpError<void>,
>(
    id: number,
    params?: GetCustomerParams,
    options?: {
        query?: UseQueryOptions<
            Awaited<ReturnType<typeof getCustomer>>,
            TError,
            TData
        >
        http?: HttpRequestConfig
    },
) {
    return useGeneratedGetCustomer<TData, TError>(id, params, {
        ...options,
        query: {
            ...options?.query,
            staleTime: GET_CUSTOMER_STALE_TIME_MS,
        },
    })
}
