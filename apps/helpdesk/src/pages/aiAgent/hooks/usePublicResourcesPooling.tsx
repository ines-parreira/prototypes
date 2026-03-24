import { useEffect, useMemo } from 'react'

import { reportError } from '@repo/logging'
import { history } from '@repo/routing'
import { useQueryClient } from '@tanstack/react-query'

import { SentryTeam } from 'common/const/sentryTeamNames'
import useAppDispatch from 'hooks/useAppDispatch'
import { useSearchParam } from 'hooks/useSearchParam'
import {
    helpCenterKeys,
    useGetArticleIngestionLogs,
} from 'models/helpCenter/queries'
import type { getArticleIngestionLogs } from 'models/helpCenter/resources'
import { useIngestionDomainBannerDismissed } from 'pages/aiAgent/AiAgentScrapedDomainContent/hooks/useIngestionDomainBannerDismissed'
import type { Components } from 'rest_api/help_center_api/client.generated'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

import { PAGE_NAME } from '../AiAgentScrapedDomainContent/constant'
import { updateArticleIngestionLogs } from '../components/PublicSourcesSection/utils'
import type { ArticleIngestionLogsStatus } from '../constants'
import { WIZARD_POST_COMPLETION_QUERY_KEY } from '../constants'
import { useAiAgentNavigation } from './useAiAgentNavigation'

const UPDATE_STATUS_INTERVAL = 5000

type UsePublicResourcesPoolingReturn = {
    articleIngestionLogsStatus: ArticleIngestionLogsStatus[]
    articleIngestionLogs?: Components.Schemas.ArticleIngestionLogDto[] | null
}

export const usePublicResourcesPooling = ({
    shopName,
    helpCenterId,
    enabled,
}: {
    helpCenterId: number
    shopName: string
    enabled?: boolean
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
            enabled: enabled || false,
        },
    )

    const { resetAllBanner } = useIngestionDomainBannerDismissed({
        shopName,
        pageName: PAGE_NAME.URL,
    })

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
            enabled: !!(
                processingArticleIngestionIds &&
                processingArticleIngestionIds.length > 0
            ),
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

        const hasError = finishedArticleIngestionIds.some(
            (log) => log.status === 'FAILED',
        )

        resetAllBanner()
        if (
            !!wizardQueryParam ||
            window.location.pathname.includes(routes.urlArticles(ids[0]))
        ) {
            return
        }

        if (isAllSuccess) {
            void dispatch(
                notify({
                    status: NotificationStatus.Success,
                    message:
                        'URL successfully synced. Review newly generated content for accuracy.',
                    buttons: [
                        {
                            name: 'Review',
                            primary: false,
                            onClick: () => {
                                history.push(
                                    routes.urlArticles(
                                        finishedArticleIngestionIds[0].id,
                                    ),
                                    {
                                        selectedResource: {
                                            id: finishedArticleIngestionIds[0]
                                                .id,
                                            url: finishedArticleIngestionIds[0]
                                                .url,
                                        },
                                    },
                                )
                            },
                        },
                    ],
                    showDismissButton: isOnboardingWizardPage,
                }),
            )
        } else if (hasError) {
            void dispatch(
                notify({
                    status: NotificationStatus.Error,
                    message:
                        'We couldn’t sync your URL. Please try again or contact support if the issue persists.',
                    showDismissButton: true,
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
        resetAllBanner,
    ])

    const articleIngestionLogsStatus = useMemo(() => {
        const logs = articleIngestionLogs || []
        return logs.map((log) => log.status)
    }, [articleIngestionLogs])

    return { articleIngestionLogsStatus, articleIngestionLogs }
}
