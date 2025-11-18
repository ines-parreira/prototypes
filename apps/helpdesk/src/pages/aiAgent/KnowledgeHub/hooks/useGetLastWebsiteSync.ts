import { useMemo } from 'react'

import { IngestionLogStatus } from 'pages/aiAgent/AiAgentScrapedDomainContent/constant'
import type { IngestionLog } from 'pages/aiAgent/AiAgentScrapedDomainContent/types'
import {
    getNextSyncDate,
    isSyncLessThan24Hours,
} from 'pages/aiAgent/AiAgentScrapedDomainContent/utils'

export function useGetLastWebsiteSync(
    storeDomainIngestionLog: IngestionLog | undefined,
) {
    const latestSync = useMemo(() => {
        if (storeDomainIngestionLog?.status === IngestionLogStatus.Pending) {
            return new Date().toISOString()
        }
        return storeDomainIngestionLog?.latest_sync
    }, [storeDomainIngestionLog])

    const isSyncLessThan24h = useMemo(
        () => isSyncLessThan24Hours(latestSync),
        [latestSync],
    )
    const nextSyncDate = useMemo(
        () => getNextSyncDate(latestSync),
        [latestSync],
    )

    return {
        latestSync,
        isSyncLessThan24h,
        nextSyncDate,
    }
}
