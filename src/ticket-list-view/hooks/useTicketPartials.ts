import { useCallback, useEffect, useMemo, useState } from 'react'

import { CursorPaginationMeta } from '@gorgias/helpdesk-queries'

import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'

import TicketUpdatesManager from '../TicketUpdatesManager'
import { TicketPartial } from '../types'
import { SortOrder } from './useSortOrder'

type State = {
    cursor: CursorPaginationMeta['next_cursor']
    initialLoaded: boolean
    partials: TicketPartial[]
}

export default function useTicketPartials(
    viewId: number,
    sortOrder: SortOrder,
) {
    const hasCursorPolling = useFlag(FeatureFlagKey.DTPCursorPolling)
    const [{ cursor, initialLoaded, partials }, setState] = useState<State>({
        cursor: null,
        initialLoaded: false,
        partials: [],
    })

    const client = useMemo(
        () => new TicketUpdatesManager(viewId, sortOrder, hasCursorPolling),
        [hasCursorPolling, sortOrder, viewId],
    )

    useEffect(
        () =>
            client.subscribe((partials, cursor) => {
                setState((s) => ({
                    ...s,
                    cursor,
                    partials,
                    initialLoaded: true,
                }))
            }),
        [client],
    )

    useEffect(() => {
        setState((s) => ({ ...s, initialLoaded: false }))
    }, [viewId])

    const loadMore = useCallback(() => {
        if (!cursor) return

        void client.loadMore()
    }, [client, cursor])

    return useMemo(
        () => ({
            hasMore: !!cursor,
            initialLoaded,
            loadMore,
            partials,
            pauseUpdates: client.pause,
            resumeUpdates: client.resume,
            setLatest: client.setLatest,
        }),
        [client, cursor, initialLoaded, loadMore, partials],
    )
}
