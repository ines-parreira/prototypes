import { useEffect, useMemo } from 'react'

import { useQueryClient } from '@tanstack/react-query'

import { SentryTeam } from 'common/const/sentryTeamNames'
import useAppDispatch from 'hooks/useAppDispatch'
import { useSearchParam } from 'hooks/useSearchParam'
import {
    helpCenterKeys,
    useGetArticleIngestionLogs,
} from 'models/helpCenter/queries'
import { getArticleIngestionLogs } from 'models/helpCenter/resources'
import history from 'pages/history'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import { reportError } from 'utils/errors'

import { updateArticleIngestionLogs } from '../components/PublicSourcesSection/utils'
import {
    ArticleIngestionLogsStatus,
    WIZARD_POST_COMPLETION_QUERY_KEY,
} from '../constants'
import { useAiAgentNavigation } from './useAiAgentNavigation'

const UPDATE_STATUS_INTERVAL = 5000

type UsePublicResourcesPoolingReturn = {
    articleIngestionLogsStatus: ArticleIngestionLogsStatus[]
}

export const usePublicResourcesPooling = ({
    shopName,
    helpCenterId,
}: {
    helpCenterId: number
    shopName: string
}): UsePublicResourcesPoolingReturn => {
    const dispatch = useAppDispatch()
    const queryClient = useQueryClient()
    const { routes } = useAiAgentNavigation({ shopName })
    const [wizardQueryParam] = useSearchParam(WIZARD_POST_COMPLETION_QUERY_KEY)

    const { data: articleIngestionLogs } = useGetArticleIngestionLogs(
        {
            help_center_id: helpCenterId,
        },
        {
            // Only read from existing cache. No fetching
            enabled: false,
        },
    )

    const processingArticleIngestionIds = useMemo(
        () =>
            articleIngestionLogs
                ?.filter((log) => log.status === 'PENDING')
                .map((log) => log.id),
        [articleIngestionLogs],
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
        },
    )

    useEffect(() => {
        if (processingArticleIngestionError) {
            reportError(processingArticleIngestionError, {
                tags: { team: SentryTeam.CONVAI_KNOWLEDGE },
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

        const isOnboardingWizardPage = window.location.pathname.includes(
            routes.onboardingWizard,
        )
        const pendingArticleIngestionIds = processingArticleIngestions.filter(
            (log) => log.status === 'PENDING',
        )

        if (
            isOnboardingWizardPage &&
            pendingArticleIngestionIds &&
            pendingArticleIngestionIds.length
        ) {
            void dispatch(
                notify({
                    status: NotificationStatus.Loading,
                    message:
                        'Syncing in progress. You can finish onboarding while sources are syncing.',
                    showDismissButton: true,
                    dismissible: true,
                }),
            )
        }

        const finishedArticleIngestionIds = processingArticleIngestions.filter(
            (log) => log.status !== 'PENDING',
        )
        if (finishedArticleIngestionIds.length === 0) return

        queryClient.setQueryData(
            helpCenterKeys.articleIngestionLogs(helpCenterId),
            (
                previous:
                    | Awaited<ReturnType<typeof getArticleIngestionLogs>>
                    | undefined,
            ) => {
                const mergedData = previous
                    ? updateArticleIngestionLogs(
                          previous,
                          finishedArticleIngestionIds,
                      )
                    : finishedArticleIngestionIds

                return mergedData
            },
        )

        // Remove cache for finished article ingestion logs
        const ids = processingArticleIngestions.map((log) => log.id)
        queryClient.removeQueries([
            helpCenterKeys.articleIngestionLogs(helpCenterId, { ids }),
        ])

        // Don't send notification if not all URL processed
        if (
            finishedArticleIngestionIds.length !==
            processingArticleIngestions.length
        ) {
            return
        }

        const isAllSuccess = finishedArticleIngestionIds.every(
            (log) => log.status === 'SUCCESSFUL',
        )

        if (!!wizardQueryParam) return

        if (isAllSuccess) {
            void dispatch(
                notify({
                    status: NotificationStatus.Success,
                    message: isOnboardingWizardPage
                        ? 'URL sources have successfully synced.'
                        : 'URL sources have successfully synced. AI Agent is now active and you can test the sources.',
                    buttons: isOnboardingWizardPage
                        ? []
                        : [
                              {
                                  name: 'Go To Test',
                                  primary: false,
                                  onClick: () => {
                                      history.push(routes.test)
                                  },
                              },
                          ],
                    showDismissButton: isOnboardingWizardPage,
                }),
            )
        } else {
            const isConfigurationPage = window.location.pathname.startsWith(
                routes.configuration(),
            )
            void dispatch(
                notify({
                    status: NotificationStatus.Error,
                    message:
                        'One or more URL sources for AI Agent failed to sync. Review URLs and try again.',
                    buttons:
                        isConfigurationPage || isOnboardingWizardPage
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
                    showDismissButton: isOnboardingWizardPage,
                }),
            )
        }
    }, [
        dispatch,
        helpCenterId,
        processingArticleIngestions,
        queryClient,
        routes,
        wizardQueryParam,
    ])

    const articleIngestionLogsStatus = useMemo(() => {
        const logs = articleIngestionLogs || []
        return logs.map((log) => log.status)
    }, [articleIngestionLogs])

    return { articleIngestionLogsStatus }
}
