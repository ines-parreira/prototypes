import { queryKeys, useListAccountSettings } from '@gorgias/helpdesk-queries'

import { VIEWS_STALE_TIME } from '../constants'
import type { PublicViewsOrderingData } from '../types'
import { isViewsOrderingData } from '../types'

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
            select: (response) => {
                const setting = response.data.data[0]
                return {
                    id: setting?.id,
                    data: isViewsOrderingData(setting?.data)
                        ? { ...EMPTY_ORDERING, ...setting.data }
                        : EMPTY_ORDERING,
                }
            },
        },
    })

    return data ?? { id: undefined, data: EMPTY_ORDERING }
}

export function usePublicViewsOrdering(): PublicViewsOrderingData {
    return usePublicViewsOrderingSetting().data
}

const EMPTY_ORDERING: PublicViewsOrderingData = {
    views: {},
    views_top: {},
    views_bottom: {},
    view_sections: {},
}
