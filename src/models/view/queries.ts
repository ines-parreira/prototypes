import {useQuery, UseQueryOptions} from '@tanstack/react-query'

import {reportError} from 'utils/errors'
import {ListParams} from './types'
import {getViewItems, UseGetViewItems} from './resources'

export const viewItemsDefinitionKeys = {
    all: () => ['view'] as const,
    details: () => [...viewItemsDefinitionKeys.all(), 'detail'] as const,
    detail: (id: number) => [...viewItemsDefinitionKeys.details(), id] as const,
}

export const useGetViewItems = (
    {viewId, ...params}: ListParams,
    overrides?: UseQueryOptions<UseGetViewItems>
) =>
    useQuery({
        queryKey: viewItemsDefinitionKeys.detail(viewId),
        queryFn: () => getViewItems({viewId, ...params}),
        onError: () => {
            reportError(
                new Error(`Failed to fetch items for view id ${viewId}`)
            )
        },
        ...overrides,
    })
