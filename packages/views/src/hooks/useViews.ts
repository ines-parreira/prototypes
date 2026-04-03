import { DurationInMs } from '@repo/utils'

import { useListAllViews } from '@gorgias/helpdesk-queries'
import type { ListViewsParams } from '@gorgias/helpdesk-types'

const VIEWS_STALE_TIME = DurationInMs.OneHour

export function useViews(
    params?: Omit<ListViewsParams, 'cursor'>,
    options?: Parameters<typeof useListAllViews>[1],
) {
    const { items: views, ...rest } = useListAllViews(
        { limit: 100, ...params },
        {
            ...options,
            query: {
                staleTime: VIEWS_STALE_TIME,
                refetchOnWindowFocus: false,
                ...options?.query,
            },
        },
    )

    return { views, ...rest }
}
