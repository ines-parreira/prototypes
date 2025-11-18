import { useEffect, useRef } from 'react'

import { IngestionLogStatus } from 'pages/aiAgent/AiAgentScrapedDomainContent/constant'
import { useGetStoreDomainIngestionLog } from 'pages/aiAgent/hooks/useGetStoreDomainIngestionLog'
import { REFETCH_KNOWLEDGE_HUB_TABLE } from 'pages/aiAgent/KnowledgeHub/constants'
import { dispatchDocumentEvent } from 'pages/aiAgent/KnowledgeHub/EmptyState/utils'

type UseDomainSyncStatusParams = {
    helpCenterId: number
    storeUrl: string | null
}

/**
 * Hook to track domain sync status and dispatch events on completion
 * Polls ingestion logs and dispatches refetch event when sync completes successfully
 */
export const useDomainSyncStatus = ({
    helpCenterId,
    storeUrl,
}: UseDomainSyncStatusParams) => {
    const { status: syncStatus, storeDomainIngestionLog } =
        useGetStoreDomainIngestionLog({
            helpCenterId,
            storeUrl,
            shouldPoll: true,
        })

    // Track previous domain sync status to detect when ingestion completes
    const prevSyncStatusRef = useRef<string | undefined>()

    useEffect(() => {
        const prevStatus = prevSyncStatusRef.current
        const currentStatus = syncStatus

        // Dispatch event when domain sync completes successfully
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
        storeDomainIngestionLog,
    }
}
