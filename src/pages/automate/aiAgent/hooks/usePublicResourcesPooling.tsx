import {useQueryClient} from '@tanstack/react-query'
import {useEffect, useMemo} from 'react'
import useAppDispatch from 'hooks/useAppDispatch'
import {
    helpCenterStatsKeys,
    useGetArticleIngestionLogs,
} from 'models/helpCenter/queries'
import history from 'pages/history'
import {reportError} from 'utils/errors'
import {AI_AGENT_SENTRY_TEAM} from 'common/const/sentryTeamNames'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {getArticleIngestionLogs} from 'models/helpCenter/resources'
import {updateArticleIngestionLogs} from '../components/PublicSourcesSection/utils'
import {useAiAgentNavigation} from './useAiAgentNavigation'

const UPDATE_STATUS_INTERVAL = 2000

export const usePublicResourcesPooling = ({
    shopName,
    helpCenterId,
}: {
    helpCenterId: number
    shopName: string
}) => {
    const dispatch = useAppDispatch()
    const queryClient = useQueryClient()
    const {routes} = useAiAgentNavigation({shopName})
    const {data: articleIngestionLogs} = useGetArticleIngestionLogs(
        {
            help_center_id: helpCenterId,
        },
        {
            // Only read from existing cache. No fetching
            enabled: false,
        }
    )

    const processingArticleIngestionIds = useMemo(
        () =>
            articleIngestionLogs
                ?.filter((log) => log.status === 'PENDING')
                .map((log) => log.id),
        [articleIngestionLogs]
    )

    // Pooling of processing article ingestion logs
    const {
        data: processingArticleIngestions,
        error: processingArticleIngestionError,
    } = useGetArticleIngestionLogs(
        {
            help_center_id: helpCenterId,
            ids: processingArticleIngestionIds,
        },
        {
            refetchInterval: UPDATE_STATUS_INTERVAL,
            enabled:
                processingArticleIngestionIds &&
                processingArticleIngestionIds.length > 0,
        }
    )

    useEffect(() => {
        if (processingArticleIngestionError) {
            reportError(processingArticleIngestionError, {
                tags: {team: AI_AGENT_SENTRY_TEAM},
                extra: {
                    context: 'Error during article ingestion logs pooling',
                },
            })
        }
    }, [processingArticleIngestionError])

    // Update article ingestion if it's status changed
    useEffect(() => {
        if (
            !processingArticleIngestions ||
            processingArticleIngestions.length === 0
        ) {
            return
        }

        const finishedArticleIngestionIds = processingArticleIngestions.filter(
            (log) => log.status !== 'PENDING'
        )
        if (finishedArticleIngestionIds.length === 0) return

        queryClient.setQueryData(
            helpCenterStatsKeys.articleIngestionLogs(helpCenterId),
            (
                previous:
                    | Awaited<ReturnType<typeof getArticleIngestionLogs>>
                    | undefined
            ) => {
                const mergedData = previous
                    ? updateArticleIngestionLogs(
                          previous,
                          finishedArticleIngestionIds
                      )
                    : finishedArticleIngestionIds

                return mergedData
            }
        )

        // Remove cache for finished article ingestion logs
        const ids = processingArticleIngestions.map((log) => log.id)
        queryClient.removeQueries([
            helpCenterStatsKeys.articleIngestionLogs(helpCenterId, {ids}),
        ])

        // Don't send notification if not all URL processed
        if (
            finishedArticleIngestionIds.length !==
            processingArticleIngestions.length
        ) {
            return
        }

        const isAllSuccess = finishedArticleIngestionIds.every(
            (log) => log.status === 'SUCCESSFUL'
        )

        if (isAllSuccess) {
            void dispatch(
                notify({
                    status: NotificationStatus.Success,
                    message:
                        'URL sources have successfully synced. AI Agent is now active and you can test the sources.',
                    buttons: [
                        {
                            name: 'Go To Test',
                            primary: false,
                            onClick: () => {
                                history.push(routes.test)
                            },
                        },
                    ],
                })
            )
        } else {
            const isConfigurationPage =
                window.location.pathname === routes.configuration
            void dispatch(
                notify({
                    status: NotificationStatus.Error,
                    message:
                        'One or more URL sources for AI Agent failed to sync. Review URLs and try again.',
                    buttons: isConfigurationPage
                        ? []
                        : [
                              {
                                  name: 'Go to Knowledge settings',
                                  primary: false,
                                  onClick: () => {
                                      history.push(routes.test)
                                  },
                              },
                          ],
                })
            )
        }
    }, [
        dispatch,
        helpCenterId,
        processingArticleIngestions,
        queryClient,
        routes,
    ])
}
