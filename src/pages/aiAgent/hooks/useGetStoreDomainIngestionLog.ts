import { useEffect, useMemo } from 'react'

import { SentryTeam } from 'common/const/sentryTeamNames'
import { useGetIngestionLogs } from 'models/helpCenter/queries'
import { reportError } from 'utils/errors'

import {
    IngestionLogStatus,
    POLLING_INTERVAL,
} from '../AiAgentScrapedDomainContent/constant'

export const useGetStoreDomainIngestionLog = ({
    helpCenterId,
    storeUrl,
    shouldPoll = false,
}: {
    helpCenterId: number
    storeUrl: string | null
    shouldPoll?: boolean
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
                const log = data?.find(
                    (log) => log.source === 'domain' && log.url === storeUrl,
                )
                return shouldPoll && log?.status === IngestionLogStatus.Pending
                    ? POLLING_INTERVAL
                    : false
            },
        },
    )

    const storeDomainIngestionLog = useMemo(
        () =>
            ingestionLogs?.find(
                (log) => log.source === 'domain' && log.url === storeUrl,
            ),
        [ingestionLogs, storeUrl],
    )

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
        status: storeDomainIngestionLog?.status,
        isGetIngestionLogsLoading,
    }
}
