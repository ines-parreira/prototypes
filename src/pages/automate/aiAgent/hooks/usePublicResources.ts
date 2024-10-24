import {useEffect, useMemo} from 'react'

import {AI_AGENT_SENTRY_TEAM} from 'common/const/sentryTeamNames'
import {useGetArticleIngestionLogs} from 'models/helpCenter/queries'
import {reportError} from 'utils/errors'

import {mapArticleIngestionLogsToSourceItem} from '../components/PublicSourcesSection/utils'

export const usePublicResources = ({helpCenterId}: {helpCenterId: number}) => {
    const {
        data: articleIngestionLogs,
        error,
        isLoading: isSourceItemsListLoading,
    } = useGetArticleIngestionLogs(
        {
            help_center_id: helpCenterId,
        },
        {
            refetchOnWindowFocus: false,
        }
    )

    const sourceItems = useMemo(
        () => articleIngestionLogs?.map(mapArticleIngestionLogsToSourceItem),
        [articleIngestionLogs]
    )

    useEffect(() => {
        if (error) {
            reportError(error, {
                tags: {team: AI_AGENT_SENTRY_TEAM},
                extra: {
                    context: 'Error during article ingestion logs fetching',
                },
            })
        }
    }, [error])

    return {sourceItems, isSourceItemsListLoading}
}
