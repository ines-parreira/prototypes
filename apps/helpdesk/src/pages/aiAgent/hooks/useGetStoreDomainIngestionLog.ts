import { useEffect, useMemo } from 'react'

import { reportError } from '@repo/logging'
import type { UseQueryOptions } from '@tanstack/react-query'

import { SentryTeam } from 'common/const/sentryTeamNames'
import { useGetIngestionLogs } from 'models/helpCenter/queries'
import type { getIngestionLogs } from 'models/helpCenter/resources'

import {
    IngestionLogStatus,
    POLLING_INTERVAL,
} from '../AiAgentScrapedDomainContent/constant'
import { getTheLatestIngestionLog } from '../AiAgentScrapedDomainContent/utils'

export const useGetStoreDomainIngestionLog = ({
    helpCenterId,
    storeUrl,
    shouldPoll = false,
    overrides,
}: {
    helpCenterId: number
    storeUrl: string | null
    shouldPoll?: boolean
    overrides?: UseQueryOptions<Awaited<ReturnType<typeof getIngestionLogs>>>
}) => {
    const {
        data: ingestionLogs,
        error,
        isLoading: isGetIngestionLogsLoading,
    } = useGetIngestionLogs(
        {
            help_center_id: helpCenterId,
        },
        {
            queryKey: ['store-domain-ingestion-logs', helpCenterId, storeUrl],
            enabled: !!storeUrl,
            refetchOnWindowFocus: false,
            refetchInterval: (data) => {
                const logs = data?.filter(
                    (log) => log.source === 'domain' && log.url === storeUrl,
                )
                const latestLog = getTheLatestIngestionLog(logs)
                return shouldPoll &&
                    latestLog?.status === IngestionLogStatus.Pending
                    ? POLLING_INTERVAL
                    : false
            },
            ...overrides,
        },
    )

    const storeDomainIngestionLogs = useMemo(
        () =>
            ingestionLogs?.filter(
                (log) => log.source === 'domain' && log.url === storeUrl,
            ),
        [ingestionLogs, storeUrl],
    )

    const storeDomainIngestionLog = getTheLatestIngestionLog(
        storeDomainIngestionLogs,
    )

    const status = useMemo(() => {
        if (!storeDomainIngestionLog?.status) {
            return undefined
        }

        if (storeDomainIngestionLog.status === IngestionLogStatus.Successful) {
            const syncTime = storeDomainIngestionLog.latest_sync
            if (syncTime) {
                const syncDate = new Date(syncTime)
                const cutoffDate = new Date('2026-01-12T00:00:00Z')

                if (syncDate < cutoffDate) {
                    return undefined
                }
            }
        }

        return storeDomainIngestionLog.status
    }, [storeDomainIngestionLog?.status, storeDomainIngestionLog?.latest_sync])

    useEffect(() => {
        if (error) {
            reportError(error, {
                tags: { team: SentryTeam.CONVAI_KNOWLEDGE },
                extra: {
                    context: 'Error during ingestion logs fetching',
                },
            })
        }
    }, [error])

    return {
        storeDomainIngestionLog,
        status,
        isGetIngestionLogsLoading,
    }
}
