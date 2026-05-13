import { appQueryClient } from '@repo/api-resources'
import { useQuery } from '@tanstack/react-query'

import { VIEWS_STALE_TIME } from '../constants'
import type { PrivateViewsOrderingData } from '../types'
import { isViewsOrderingData } from '../types'
import { getWindowUserSettings } from './windowUserSettings'

export type PrivateViewsOrderingSetting = {
    id: number | undefined
    data: PrivateViewsOrderingData
}

export const PRIVATE_VIEWS_ORDERING_QUERY_KEY = ['views', 'ordering', 'private']

// TODO: Replace queryFn with a real SDK query hook (useListCurrentUserSettings)
// when the listCurrentUserSettings endpoint is implemented in the API spec.
export function usePrivateViewsOrderingSetting(): PrivateViewsOrderingSetting {
    const { data } = useQuery({
        queryKey: PRIVATE_VIEWS_ORDERING_QUERY_KEY,
        queryFn: loadFromWindow,
        staleTime: VIEWS_STALE_TIME,
        refetchOnWindowFocus: false,
    })

    return data ?? { id: undefined, data: EMPTY_ORDERING }
}

export function usePrivateViewsOrdering(): PrivateViewsOrderingData {
    return usePrivateViewsOrderingSetting().data
}

/**
 * Non-hook variant: reads the private views ordering from the React Query
 * cache used by `usePrivateViewsOrdering`. Falls back to the same
 * window-settings lookup `loadFromWindow` does when the cache is empty.
 */
export function getPrivateViewsOrdering(): PrivateViewsOrderingData {
    const cached = appQueryClient.getQueryData<PrivateViewsOrderingSetting>(
        PRIVATE_VIEWS_ORDERING_QUERY_KEY,
    )
    return (cached ?? loadFromWindow()).data
}

const EMPTY_ORDERING: PrivateViewsOrderingData = {
    views: {},
    view_sections: {},
}

function loadFromWindow(): PrivateViewsOrderingSetting {
    const setting = getWindowUserSettings().find(
        (s) => s.type === 'views-ordering',
    )

    return {
        id: setting?.id,
        data: isViewsOrderingData(setting?.data)
            ? { ...EMPTY_ORDERING, ...setting.data }
            : EMPTY_ORDERING,
    }
}
