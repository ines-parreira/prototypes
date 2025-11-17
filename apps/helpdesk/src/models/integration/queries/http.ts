import type { UseQueryOptions } from '@tanstack/react-query'
import { useQuery } from '@tanstack/react-query'

import { getHTTPEvent, getHTTPEvents } from 'models/integration/resources/http'

export const HTTPEventKeys = {
    list: (integrationId: number) => ['HTTPEvent', integrationId] as const,
    detail: (integrationId: number, eventId: number) =>
        [...HTTPEventKeys.list(integrationId), eventId] as const,
}

export const useGetHTTPEvents = <
    TData = Awaited<ReturnType<typeof getHTTPEvents>>,
>(
    integrationId: number,
    overrides?: UseQueryOptions<
        Awaited<ReturnType<typeof getHTTPEvents>>,
        unknown,
        TData
    >,
) => {
    return useQuery({
        queryKey: HTTPEventKeys.list(integrationId),
        queryFn: () => getHTTPEvents(integrationId),
        ...overrides,
    })
}

export const useGetHTTPEvent = <
    TData = Awaited<ReturnType<typeof getHTTPEvent>>,
>(
    { integrationId, eventId }: { integrationId: number; eventId: number },
    overrides?: UseQueryOptions<
        Awaited<ReturnType<typeof getHTTPEvent>>,
        unknown,
        TData
    >,
) => {
    return useQuery({
        queryKey: HTTPEventKeys.detail(integrationId, eventId),
        queryFn: () => getHTTPEvent(integrationId, eventId),
        ...overrides,
    })
}
