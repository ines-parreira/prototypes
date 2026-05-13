import { appQueryClient } from '@repo/api-resources'

import { queryKeys, useListAccountSettings } from '@gorgias/helpdesk-queries'
import type { ListAccountSettings200 } from '@gorgias/helpdesk-types'

import { VIEWS_STALE_TIME } from '../constants'
import type { PublicViewsOrderingData } from '../types'
import { isViewsOrderingData } from '../types'

// `useListAccountSettings` caches the helpdesk-client response with the body
// under `.data`. Local alias keeps us from importing `HttpResponse`.
type ListAccountSettingsResponse = { data: ListAccountSettings200 }

export type PublicViewsOrderingSetting = {
    id: number | undefined
    data: PublicViewsOrderingData
}

const QUERY_PARAMS = { type: 'views-ordering' } as const

export const PUBLIC_VIEWS_ORDERING_QUERY_KEY =
    queryKeys.account.listAccountSettings(QUERY_PARAMS)

export function usePublicViewsOrderingSetting(): PublicViewsOrderingSetting {
    const { data } = useListAccountSettings(QUERY_PARAMS, {
        query: {
            staleTime: VIEWS_STALE_TIME,
            refetchOnWindowFocus: false,
            select: (response) => parsePublicViewsOrderingResponse(response),
        },
    })

    return data ?? { id: undefined, data: EMPTY_ORDERING }
}

export function usePublicViewsOrdering(): PublicViewsOrderingData {
    return usePublicViewsOrderingSetting().data
}

/**
 * Non-hook variant: reads the public views ordering from the React Query
 * cache used by `usePublicViewsOrdering`. Falls back to the empty ordering
 * if the cache is empty or the payload is malformed.
 */
export function getPublicViewsOrdering(): PublicViewsOrderingData {
    const response = appQueryClient.getQueryData<ListAccountSettingsResponse>(
        PUBLIC_VIEWS_ORDERING_QUERY_KEY,
    )
    if (!response) return EMPTY_ORDERING
    return parsePublicViewsOrderingResponse(response).data
}

function parsePublicViewsOrderingResponse(
    response: ListAccountSettingsResponse,
): PublicViewsOrderingSetting {
    const setting = response.data?.data?.[0]
    return {
        id: setting?.id,
        data: isViewsOrderingData(setting?.data)
            ? { ...EMPTY_ORDERING, ...setting.data }
            : EMPTY_ORDERING,
    }
}

const EMPTY_ORDERING: PublicViewsOrderingData = {
    views: {},
    views_top: {},
    views_bottom: {},
    view_sections: {},
}
