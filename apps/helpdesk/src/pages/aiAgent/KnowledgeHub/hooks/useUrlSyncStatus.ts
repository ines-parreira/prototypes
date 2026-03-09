import { useEffect, useMemo, useRef } from 'react'

import { IngestionLogStatus } from 'pages/aiAgent/AiAgentScrapedDomainContent/constant'
import { useSyncUrl } from 'pages/aiAgent/hooks/useSyncUrl'
import { REFETCH_KNOWLEDGE_HUB_TABLE } from 'pages/aiAgent/KnowledgeHub/constants'
import { dispatchDocumentEvent } from 'pages/aiAgent/KnowledgeHub/EmptyState/utils'

type UseUrlSyncStatusParams = {
    helpCenterId: number
    existingUrls: string[]
    helpCenterCustomDomains: string[]
    shopName: string
}

/**
 * Hook to track URL sync status and dispatch events on completion
 * Polls ingestion logs and dispatches refetch event when sync completes successfully
 * Tracks multiple URLs that may be syncing simultaneously
 */
export const useUrlSyncStatus = ({
    helpCenterId,
    existingUrls,
    helpCenterCustomDomains,
    shopName,
}: UseUrlSyncStatusParams) => {
    const { latestUrlIngestionLog, urlIngestionLogs } = useSyncUrl({
        helpCenterId,
        existingUrls,
        helpCenterCustomDomains,
        shopName,
    })

    const syncStatus = useMemo(() => {
        if (
            urlIngestionLogs?.some(
                (log) => log.status === IngestionLogStatus.Pending,
            )
        ) {
            return IngestionLogStatus.Pending
        }

        if (latestUrlIngestionLog?.status === IngestionLogStatus.Successful) {
            const syncTime = latestUrlIngestionLog.latest_sync
            if (syncTime) {
                const syncDate = new Date(syncTime)
                const cutoffDate = new Date('2026-01-12T00:00:00Z')

                if (syncDate < cutoffDate) {
                    return undefined
                }
            }
        }

        return latestUrlIngestionLog?.status
    }, [
        urlIngestionLogs,
        latestUrlIngestionLog?.status,
        latestUrlIngestionLog?.latest_sync,
    ])

    const syncingUrls = useMemo(() => {
        return (
            urlIngestionLogs
                ?.filter((log) => log.status === IngestionLogStatus.Pending)
                .map((log) => log.url)
                .filter((url): url is string => !!url) || []
        )
    }, [urlIngestionLogs])

    const recentUrlIngestionLogs = useMemo(() => {
        if (!urlIngestionLogs) return []

        const pendingLogs = urlIngestionLogs.filter(
            (log) => log.status === IngestionLogStatus.Pending,
        )

        if (pendingLogs.length === 0) return []

        const timestamps = pendingLogs
            .filter((log) => log.latest_sync || log.created_datetime)
            .map((log) =>
                new Date(log.latest_sync || log.created_datetime).getTime(),
            )
        const syncRoundStartTime = Math.min(...timestamps)

        if (!Number.isFinite(syncRoundStartTime)) {
            return urlIngestionLogs
        }

        return urlIngestionLogs.filter((log) => {
            if (!log.latest_sync && !log.created_datetime) return false
            const createdTime = new Date(
                log.latest_sync || log.created_datetime,
            ).getTime()
            return createdTime >= syncRoundStartTime
        })
    }, [urlIngestionLogs])

    const { totalCount, completedCount, successCount, pendingCount } =
        useMemo(() => {
            if (recentUrlIngestionLogs.length === 0) {
                return { totalCount: 0, completedCount: 0, successCount: 0 }
            }

            const successful = recentUrlIngestionLogs.filter(
                (log) => log.status === IngestionLogStatus.Successful,
            )
            const failed = recentUrlIngestionLogs.filter(
                (log) => log.status === IngestionLogStatus.Failed,
            )

            const pending = recentUrlIngestionLogs.filter(
                (log) => log.status === IngestionLogStatus.Pending,
            )

            return {
                totalCount: recentUrlIngestionLogs.length,
                completedCount: successful.length + failed.length,
                successCount: successful.length,
                pendingCount: pending.length,
            }
        }, [recentUrlIngestionLogs])

    const prevSyncStatusRef = useRef<string | undefined>()

    useEffect(() => {
        const prevStatus = prevSyncStatusRef.current
        const currentStatus = syncStatus

        if (
            prevStatus === IngestionLogStatus.Pending &&
            currentStatus === IngestionLogStatus.Successful
        ) {
            dispatchDocumentEvent(REFETCH_KNOWLEDGE_HUB_TABLE)
        }

        prevSyncStatusRef.current = currentStatus
    }, [syncStatus])

    return {
        syncStatus,
        latestUrlIngestionLog,
        syncingUrls,
        urlIngestionLogs,
        totalCount,
        completedCount,
        successCount,
        pendingCount,
    }
}
