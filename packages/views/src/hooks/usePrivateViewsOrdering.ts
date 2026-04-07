import { useQuery } from '@tanstack/react-query'

import { VIEWS_STALE_TIME } from '../constants'
import type { PrivateViewsOrderingData } from '../types'
import { isViewsOrderingData } from '../types'
import { getWindowUserSettings } from './windowUserSettings'

const EMPTY_ORDERING: PrivateViewsOrderingData = {
    views: {},
    view_sections: {},
}

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
