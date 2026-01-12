import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { useGetFileIngestion } from 'models/helpCenter/queries'
import { IngestionLogStatus } from 'pages/aiAgent/AiAgentScrapedDomainContent/constant'
import {
    FILE_UPLOAD_STARTED,
    REFETCH_KNOWLEDGE_HUB_TABLE,
} from 'pages/aiAgent/KnowledgeHub/constants'
import {
    dispatchDocumentEvent,
    useListenToDocumentEvent,
} from 'pages/aiAgent/KnowledgeHub/EmptyState/utils'
import type { Components } from 'rest_api/help_center_api/client.generated'

type UseFileIngestionStatusParams = {
    helpCenterId: number
}

/**
 * Hook to track file ingestion status and dispatch events on completion
 * Polls file ingestion logs and dispatches refetch event when each file completes
 * Shows banner status with progress (X out of Y documents)
 */
export const useFileIngestionStatus = ({
    helpCenterId,
}: UseFileIngestionStatusParams) => {
    const [shouldPoll, setShouldPoll] = useState(false)

    const handleFileUploadStarted = useCallback(() => {
        setShouldPoll(true)
    }, [])

    useListenToDocumentEvent(FILE_UPLOAD_STARTED, handleFileUploadStarted)

    const { data: fileIngestionResponse } = useGetFileIngestion(
        {
            help_center_id: helpCenterId,
        },
        {
            enabled: !!helpCenterId && shouldPoll,
            refetchOnWindowFocus: false,
            refetchInterval: false,
        },
    )

    const fileIngestionLogs = useMemo(
        () => fileIngestionResponse?.data || [],
        [fileIngestionResponse?.data],
    )

    useEffect(() => {
        if (!shouldPoll) return

        if (fileIngestionLogs.length === 0) {
            setShouldPoll(false)
            return
        }

        const hasPending = fileIngestionLogs.some(
            (log) => log.status === IngestionLogStatus.Pending,
        )
        if (!hasPending) {
            setShouldPoll(false)
        }
    }, [shouldPoll, fileIngestionLogs])

    const latestFileIngestionLog = useMemo(() => {
        if (!fileIngestionLogs.length) return undefined

        return fileIngestionLogs.reduce(
            (
                latest: Components.Schemas.RetrieveFileIngestionLogDto,
                current: Components.Schemas.RetrieveFileIngestionLogDto,
            ) => {
                if (!latest) return current
                const latestDate = new Date(latest.uploaded_datetime).getTime()
                const currentDate = new Date(
                    current.uploaded_datetime,
                ).getTime()
                return currentDate > latestDate ? current : latest
            },
        )
    }, [fileIngestionLogs])

    const fileIngestionStatus = useMemo(() => {
        if (!fileIngestionLogs.length) return undefined

        const hasPending = fileIngestionLogs.some(
            (log) => log.status === IngestionLogStatus.Pending,
        )
        if (hasPending) return IngestionLogStatus.Pending

        if (latestFileIngestionLog?.status === IngestionLogStatus.Successful) {
            const uploadTime = latestFileIngestionLog.uploaded_datetime
            if (uploadTime) {
                const uploadDate = new Date(uploadTime)
                const cutoffDate = new Date('2026-01-12T00:00:00Z')

                if (uploadDate < cutoffDate) {
                    return undefined
                }
            }
        }

        return latestFileIngestionLog?.status
    }, [fileIngestionLogs, latestFileIngestionLog])

    const { totalCount, completedCount, successCount, pendingCount } =
        useMemo(() => {
            const successful = fileIngestionLogs.filter(
                (log) => log.status === IngestionLogStatus.Successful,
            )
            const failed = fileIngestionLogs.filter(
                (log) => log.status === IngestionLogStatus.Failed,
            )
            const pending = fileIngestionLogs.filter(
                (log) => log.status === IngestionLogStatus.Pending,
            )

            return {
                totalCount: fileIngestionLogs.length,
                completedCount: successful.length + failed.length,
                successCount: successful.length,
                pendingCount: pending.length,
            }
        }, [fileIngestionLogs])

    const prevFileStatusesRef = useRef<Map<number, string>>(new Map())

    useEffect(() => {
        const prevStatuses = prevFileStatusesRef.current
        const currentStatuses = new Map(
            fileIngestionLogs.map((log) => [log.id, log.status]),
        )

        fileIngestionLogs.forEach((log) => {
            const prevStatus = prevStatuses.get(log.id)
            const currentStatus = log.status

            if (
                prevStatus === IngestionLogStatus.Pending &&
                (currentStatus === IngestionLogStatus.Successful ||
                    currentStatus === IngestionLogStatus.Failed)
            ) {
                dispatchDocumentEvent(REFETCH_KNOWLEDGE_HUB_TABLE)
            }
        })

        prevFileStatusesRef.current = currentStatuses
    }, [fileIngestionLogs])

    return {
        fileIngestionStatus,
        fileIngestionLogs,
        totalCount,
        completedCount,
        successCount,
        pendingCount,
    }
}
