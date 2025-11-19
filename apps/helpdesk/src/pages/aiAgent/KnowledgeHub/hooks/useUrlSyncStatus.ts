import { useEffect, useMemo, useRef } from 'react'

import { IngestionLogStatus } from 'pages/aiAgent/AiAgentScrapedDomainContent/constant'
import { useSyncUrl } from 'pages/aiAgent/hooks/useSyncUrl'
import { REFETCH_KNOWLEDGE_HUB_TABLE } from 'pages/aiAgent/KnowledgeHub/constants'
import { dispatchDocumentEvent } from 'pages/aiAgent/KnowledgeHub/EmptyState/utils'

type UseUrlSyncStatusParams = {
    helpCenterId: number
    existingUrls: string[]
    helpCenterCustomDomains: string[]
    storeUrl: string | null
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
    storeUrl,
}: UseUrlSyncStatusParams) => {
    const { latestUrlIngestionLog, urlIngestionLogs } = useSyncUrl({
        helpCenterId,
        existingUrls,
        helpCenterCustomDomains,
        storeUrl,
    })

    const syncStatus = latestUrlIngestionLog?.status

    // Get all URLs that are currently syncing
    const syncingUrls = useMemo(() => {
        return (
            urlIngestionLogs
                ?.filter((log) => log.status === IngestionLogStatus.Pending)
                .map((log) => log.url)
                .filter((url): url is string => !!url) || []
        )
    }, [urlIngestionLogs])

    // Track previous URL sync status to detect when ingestion completes
    const prevSyncStatusRef = useRef<string | undefined>()

    useEffect(() => {
        const prevStatus = prevSyncStatusRef.current
        const currentStatus = syncStatus

        // Dispatch event when URL sync completes successfully
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
    }
}
