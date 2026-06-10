import { useGetTicket as useGetTicketPrimitive } from '@gorgias/helpdesk-queries'
import type { GetTicketResult, HttpError } from '@gorgias/helpdesk-types'
import { Duration } from '@gorgias/toolkit'

type UseGetTicketPrimitiveParams<TData, TError> = Parameters<
    typeof useGetTicketPrimitive<TData, TError>
>

type TicketResponseWithUpdatedDatetime = {
    data?: {
        updated_datetime?: string | null
    }
}

function getUpdatedDatetimeMs(data: unknown) {
    const updatedDatetime = (data as TicketResponseWithUpdatedDatetime | null)
        ?.data?.updated_datetime

    if (typeof updatedDatetime !== 'string') {
        return null
    }

    const updatedDatetimeMs = Date.parse(updatedDatetime)
    return Number.isNaN(updatedDatetimeMs) ? null : updatedDatetimeMs
}

function preserveNewestTicketData<TData>(
    oldData: TData | undefined,
    newData: TData,
): TData {
    if (!oldData) {
        return newData
    }

    const oldUpdatedDatetimeMs = getUpdatedDatetimeMs(oldData)
    const newUpdatedDatetimeMs = getUpdatedDatetimeMs(newData)

    if (
        oldUpdatedDatetimeMs !== null &&
        newUpdatedDatetimeMs !== null &&
        newUpdatedDatetimeMs < oldUpdatedDatetimeMs
    ) {
        return oldData
    }

    return newData
}

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
            structuralSharing: preserveNewestTicketData,
            ...options?.query,
        },
    }

    return useGetTicketPrimitive<TData, TError>(ticketId, params, mergedOptions)
}
