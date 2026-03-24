import { useEffect, useRef } from 'react'

import useAppDispatch from 'hooks/useAppDispatch'
import { IngestionLogStatus } from 'pages/aiAgent/AiAgentScrapedDomainContent/constant'
import { useGetStoreDomainIngestionLog } from 'pages/aiAgent/hooks/useGetStoreDomainIngestionLog'
import { REFETCH_KNOWLEDGE_HUB_TABLE } from 'pages/aiAgent/KnowledgeHub/constants'
import { dispatchDocumentEvent } from 'pages/aiAgent/KnowledgeHub/EmptyState/utils'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

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
    const dispatch = useAppDispatch()
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

        if (prevStatus === IngestionLogStatus.Pending) {
            if (currentStatus === IngestionLogStatus.Successful) {
                dispatchDocumentEvent(REFETCH_KNOWLEDGE_HUB_TABLE)
                void dispatch(
                    notify({
                        message:
                            'Your store website has been synced successfully.',
                        status: NotificationStatus.Success,
                    }),
                )
            }

            if (currentStatus === IngestionLogStatus.Failed) {
                void dispatch(
                    notify({
                        message:
                            "We couldn't sync your store website. Please try again or contact support.",
                        status: NotificationStatus.Error,
                    }),
                )
            }
        }

        prevSyncStatusRef.current = currentStatus
    }, [syncStatus, dispatch])

    return {
        syncStatus,
        storeDomainIngestionLog,
    }
}
