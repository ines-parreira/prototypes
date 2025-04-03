import { useEffect, useMemo } from 'react'

import { SentryTeam } from 'common/const/sentryTeamNames'
import { useGetIngestionLogs } from 'models/helpCenter/queries'
import { reportError } from 'utils/errors'

export const useGetStoreDomainIngestionLog = ({
    helpCenterId,
    storeUrl,
}: {
    helpCenterId: number
    storeUrl: string | null
}) => {
    const {
        data: ingestionLogs,
        error,
        isLoading: isIngestionLogsLoading,
    } = useGetIngestionLogs(
        {
            help_center_id: helpCenterId,
        },
        {
            refetchOnWindowFocus: false,
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

    if (!storeUrl) {
        return { storeDomainIngestionLog: null, isIngestionLogsLoading }
    }

    return { storeDomainIngestionLog, isIngestionLogsLoading }
}
