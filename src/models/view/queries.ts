import { useQuery } from '@tanstack/react-query'

import {
    getViewTicketUpdates,
    ViewTicketUpdatesParams,
} from 'models/view/resources'

export const viewItemsDefinitionKeys = {
    all: () => ['view'] as const,
    lists: () => [...viewItemsDefinitionKeys.all(), 'list'] as const,
    list: (params: { query: string }) => [
        ...viewItemsDefinitionKeys.lists(),
        params,
    ],
    details: () => [...viewItemsDefinitionKeys.all(), 'detail'] as const,
    detail: (id: number) => [...viewItemsDefinitionKeys.details(), id] as const,
    updates: (viewId: number) =>
        [
            ...viewItemsDefinitionKeys.all(),
            viewId,
            'tickets',
            'updates',
        ] as const,
}

export const useGetViewTicketUpdates = (
    { viewId, params }: { viewId: number; params?: ViewTicketUpdatesParams },
    {
        enabled = true,
        refetchOnWindowFocus = true,
    }: { enabled?: boolean; refetchOnWindowFocus?: boolean },
) => {
    return useQuery({
        queryFn: () => getViewTicketUpdates(viewId, params),
        queryKey: viewItemsDefinitionKeys.updates(viewId),
        enabled,
        refetchOnWindowFocus,
    })
}
