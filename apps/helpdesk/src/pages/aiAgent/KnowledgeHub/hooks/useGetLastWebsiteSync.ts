import { useMemo } from 'react'

import type { IngestionLog } from 'pages/aiAgent/AiAgentScrapedDomainContent/types'
import {
    getEffectiveSyncTime,
    getNextSyncDate,
    isSyncLessThan24Hours,
} from 'pages/aiAgent/AiAgentScrapedDomainContent/utils'

export function useGetLastWebsiteSync(
    storeDomainIngestionLog: IngestionLog | undefined,
) {
    const latestSync = useMemo(() => {
        return getEffectiveSyncTime(storeDomainIngestionLog)
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
