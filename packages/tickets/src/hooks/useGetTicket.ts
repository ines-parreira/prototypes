import { useGetTicket as useGetTicketPrimitive } from '@gorgias/helpdesk-queries'
import type { GetTicketResult, HttpError } from '@gorgias/helpdesk-types'
import { Duration } from '@gorgias/toolkit'

type UseGetTicketPrimitiveParams<TData, TError> = Parameters<
    typeof useGetTicketPrimitive<TData, TError>
>

export function useGetTicket<
    TData = GetTicketResult,
    TError = HttpError<unknown>,
>(
    ticketId: UseGetTicketPrimitiveParams<TData, TError>[0],
    params?: UseGetTicketPrimitiveParams<TData, TError>[1],
    options?: UseGetTicketPrimitiveParams<TData, TError>[2],
): ReturnType<typeof useGetTicketPrimitive<TData, TError>> {
    const mergedOptions = {
        ...options,
        query: {
            staleTime: Duration.minutes(5),
            ...options?.query,
        },
    }

    return useGetTicketPrimitive<TData, TError>(ticketId, params, mergedOptions)
}
