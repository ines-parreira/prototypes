import { useEffect, useMemo } from 'react'

import { useQueryClient } from '@tanstack/react-query'

import {
    useListServiceConnectionsByAppIds,
    useListServiceConnectionStoresByConnectionIds,
} from 'models/integration/queries'
import type { VisualBuilderGraph } from 'pages/automate/workflows/models/visualBuilderGraph.types'

export type StepServiceConnectionStatus = {
    hasConnection: boolean
}

export type StepServiceConnectionStatuses = {
    byAppId: Partial<Record<string, StepServiceConnectionStatus>>
    isLoading: boolean
}

const collectAppIds = (graph: VisualBuilderGraph): string[] => {
    const ids = new Set<string>()
    for (const app of graph.apps ?? []) {
        if (app.type === 'app') {
            ids.add(app.app_id)
        }
    }
    return [...ids]
}

export const useStepServiceConnectionStatuses = (
    graph: VisualBuilderGraph,
    enabled = true,
    currentStoreId?: number,
): StepServiceConnectionStatuses => {
    const queryClient = useQueryClient()
    const appIds = useMemo(
        () => (enabled ? collectAppIds(graph) : []),
        [graph, enabled],
    )

    useEffect(() => {
        if (!enabled || appIds.length === 0) return

        const handleVisibilityChange = () => {
            if (document.hidden) return
            void queryClient.invalidateQueries({
                queryKey: ['integration', 'service-connections'],
            })
        }

        document.addEventListener('visibilitychange', handleVisibilityChange)
        return () => {
            document.removeEventListener(
                'visibilitychange',
                handleVisibilityChange,
            )
        }
    }, [enabled, appIds.length, queryClient])

    const connectionQueries = useListServiceConnectionsByAppIds(appIds)

    const connectionIds = useMemo(
        () =>
            connectionQueries.flatMap((query) =>
                query.isSuccess ? query.data.map((c) => c.id) : [],
            ),
        [connectionQueries],
    )
    const storeQueries =
        useListServiceConnectionStoresByConnectionIds(connectionIds)

    const storesByConnectionId = useMemo(() => {
        const map = new Map<string, ReadonlySet<number>>()
        connectionIds.forEach((connectionId, index) => {
            const query = storeQueries[index]
            if (!query?.isSuccess) return
            map.set(
                connectionId,
                new Set(query.data.map((store) => store.store_id)),
            )
        })
        return map
    }, [connectionIds, storeQueries])

    const isLoading =
        connectionQueries.some((query) => query.isInitialLoading) ||
        storeQueries.some((query) => query.isInitialLoading)

    const byAppId: Partial<Record<string, StepServiceConnectionStatus>> = {}
    appIds.forEach((appId, index) => {
        const connectionQuery = connectionQueries[index]
        if (!connectionQuery?.isSuccess) return

        const hasConnection = connectionQuery.data.some((connection) => {
            if (currentStoreId == null) {
                return true
            }
            const assignedStoreIds = storesByConnectionId.get(connection.id)
            return assignedStoreIds?.has(currentStoreId) ?? false
        })

        byAppId[appId] = { hasConnection }
    })

    return { byAppId, isLoading }
}
