import { useEffect, useMemo } from 'react'

import { SentryTeam } from 'common/const/sentryTeamNames'
import { useGetArticleIngestionLogs } from 'models/helpCenter/queries'
import { reportError } from 'utils/errors'

import { mapArticleIngestionLogsToSourceItem } from '../components/PublicSourcesSection/utils'

export const usePublicResources = ({
    helpCenterId,
}: {
    helpCenterId?: number
}) => {
    const {
        data: articleIngestionLogs,
        error,
        isLoading: isSourceItemsListLoading,
    } = useGetArticleIngestionLogs(
        {
            help_center_id: helpCenterId ?? -1,
        },
        {
            refetchOnWindowFocus: false,
            enabled: !!helpCenterId,
        },
    )

    const sourceItems = useMemo(
        () => articleIngestionLogs?.map(mapArticleIngestionLogsToSourceItem),
        [articleIngestionLogs],
    )

    useEffect(() => {
        if (error) {
            reportError(error, {
                tags: { team: SentryTeam.CONVAI_KNOWLEDGE },
                extra: {
                    context: 'Error during article ingestion logs fetching',
                },
            })
        }
    }, [error])

    return { sourceItems, isSourceItemsListLoading }
}
