import { useEffect } from 'react'

import {
    createSchedulerV3,
    logViewEvent,
    useAllViewsLoaded,
    useSchedulerConfigV3,
    useViewCountSchedulerVersion,
    ViewCountSchedulerVersion,
} from '@repo/views'

import socketManager from 'services/socketManager/socketManager'
import { SocketEventType } from 'services/socketManager/types'

const FETCH_ALL_CHUNK_SIZE = 10
const FETCH_ALL_CHUNK_INTERVAL_MS = 500

export default function useViewCountSchedulerV3(): void {
    const { version } = useViewCountSchedulerVersion()
    const isEnabled = version === ViewCountSchedulerVersion.V3
    const config = useSchedulerConfigV3()
    // Defer scheduler startup until `useListAllViews` has exhausted pagination.
    // `maybeFireFetchAll` reads the view list synchronously from the React
    // Query cache; firing before pagination is complete would send a partial
    // list and stamp `lastFetchAllAt`, locking out the correct bulk fetch for
    // the cooldown window.
    const viewsLoaded = useAllViewsLoaded()

    useEffect(() => {
        if (!isEnabled || !viewsLoaded) return

        const scheduler = createSchedulerV3({
            onRefresh: (viewIds) => {
                socketManager.send(SocketEventType.ViewsCountExpired, {
                    viewIds,
                })
            },
            onFetchAll: sendFetchAllChunks,
            config,
        })
        scheduler.start()

        function handleFocus() {
            scheduler.steal()
        }

        window.addEventListener('focus', handleFocus)

        return () => {
            window.removeEventListener('focus', handleFocus)
            scheduler.stop()
        }
    }, [isEnabled, viewsLoaded, config])
}

/**
 * Mirrors the pre-scheduler `fetchVisibleViewsCounts` shape: chunk into
 * groups of 10, stagger by 500 ms, and stamp each payload with `all: true`
 * so the server treats it as a bulk hydration.
 */
function sendFetchAllChunks(viewIds: number[]): void {
    const chunks: number[][] = []
    for (let i = 0; i < viewIds.length; i += FETCH_ALL_CHUNK_SIZE) {
        chunks.push(viewIds.slice(i, i + FETCH_ALL_CHUNK_SIZE))
    }
    function sendNext(): void {
        const next = chunks.shift()
        if (!next) return
        socketManager.send(SocketEventType.ViewsCountExpired, {
            viewIds: next,
            all: true,
        })
        logViewEvent('outbound', 'views-count-fetch-all-chunk', next)
        if (chunks.length > 0) {
            setTimeout(sendNext, FETCH_ALL_CHUNK_INTERVAL_MS)
        }
    }
    sendNext()
}
