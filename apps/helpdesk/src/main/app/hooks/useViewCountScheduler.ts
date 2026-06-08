import { useEffect } from 'react'
import { Duration } from '@gorgias/toolkit'

import {
    createScheduler,
    logViewEvent,
    syncViewedFromUrl,
    useAllViewsLoaded,
    useSchedulerConfig,
    useViewCountSchedulerVersion,
    ViewCountSchedulerVersion,
} from '@repo/views'

import socketManager from 'services/socketManager/socketManager'
import { SocketEventType } from 'services/socketManager/types'
import { useIsSocketConnected } from 'services/socketManager/useIsSocketConnected'

const FETCH_ALL_CHUNK_SIZE = 10
export default function useViewCountScheduler(): void {
    const { version } = useViewCountSchedulerVersion()
    const isEnabled = version === ViewCountSchedulerVersion.V3
    const config = useSchedulerConfig()
    // Defer scheduler startup until `useListAllViews` has exhausted pagination.
    // The leader-takeover scan reads the view list synchronously from the
    // React Query cache; firing before pagination is complete would miss
    // views and not dispatch counts for them until the next takeover.
    const viewsLoaded = useAllViewsLoaded()
    // Defer the initial dispatch until the SharedWorker reports the WS is
    // up. `socketManager.send` is fire-and-forget — without this gate, the
    // takeover scan can send view IDs to a worker whose socket isn't live,
    // and the payload is silently dropped.
    const isSocketConnected = useIsSocketConnected()

    useEffect(() => {
        if (!isEnabled || !viewsLoaded) return

        syncViewedFromUrl()
    }, [isEnabled, viewsLoaded])

    useEffect(() => {
        if (!isEnabled || !viewsLoaded || !isSocketConnected) return

        const scheduler = createScheduler({
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
    }, [isEnabled, viewsLoaded, isSocketConnected, config])
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
            setTimeout(sendNext, Duration.millis(500))
        }
    }
    sendNext()
}
