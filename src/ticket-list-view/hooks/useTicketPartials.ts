import {useCallback, useEffect, useMemo, useState} from 'react'

import {CursorMeta} from 'models/api/types'

import TicketUpdatesManager from '../TicketUpdatesManager'
import {TicketPartial} from '../types'
import {SortOrder} from './useSortOrder'

type State = {
    cursor: CursorMeta['next_cursor']
    loading: boolean
    partials: TicketPartial[]
}

export default function useTicketPartials(
    viewId: number,
    sortOrder: SortOrder
) {
    const [{cursor, loading, partials}, setState] = useState<State>({
        cursor: null,
        loading: false,
        partials: [],
    })

    const client = useMemo(
        () => new TicketUpdatesManager(viewId, sortOrder),
        [sortOrder, viewId]
    )

    useEffect(
        () =>
            client.subscribe((partials, cursor) => {
                setState((s) => ({...s, cursor, partials}))
            }),
        [client]
    )

    const loadMore = useCallback(() => {
        if (!cursor) return

        void client.loadMore()
    }, [client, cursor])

    return useMemo(
        () => ({
            hasMore: !!cursor,
            loading,
            loadMore,
            partials,
            setLatest: client.setLatest,
        }),
        [client, cursor, loading, loadMore, partials]
    )
}
