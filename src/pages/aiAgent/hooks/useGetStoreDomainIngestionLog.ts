import { useEffect, useMemo } from 'react'

import { SentryTeam } from 'common/const/sentryTeamNames'
import { useGetIngestionLogs } from 'models/helpCenter/queries'
import { reportError } from 'utils/errors'

import {
    IngestionLogStatus,
    POLLING_INTERVAL,
} from '../AiAgentScrapedDomainContent/constant'
import { getTheLatestIngestionLog } from '../AiAgentScrapedDomainContent/utils'

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
                const logs = data?.filter(
                    (log) => log.source === 'domain' && log.url === storeUrl,
                )
                const latestLog = getTheLatestIngestionLog(logs)
                return shouldPoll &&
                    latestLog?.status === IngestionLogStatus.Pending
                    ? POLLING_INTERVAL
                    : false
            },
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
