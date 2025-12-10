import { useEffect, useMemo } from 'react'

import { history } from '@repo/routing'

import useAppDispatch from 'hooks/useAppDispatch'
import {
    useGetHelpCenterArticle,
    useGetIngestedResource,
} from 'models/helpCenter/queries'
import type { LocaleCode } from 'models/helpCenter/types'
import { useAiAgentNavigation } from 'pages/aiAgent/hooks/useAiAgentNavigation'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

export const useSelectedQuestionAndDetail = ({
    shopName,
    helpCenterId,
    defaultLocale,
    articleId,
    storeDomainIngestionLogId,
}: {
    shopName: string
    articleId: number | null
    helpCenterId: number
    defaultLocale: LocaleCode
    storeDomainIngestionLogId: number | null
}) => {
    const dispatch = useAppDispatch()
    const { routes } = useAiAgentNavigation({ shopName })

    const {
        data: articleData,
        isInitialLoading: isFetchingArticleLoading,
        isError: isFetchingArticleError,
    } = useGetHelpCenterArticle(
        articleId ?? 0,
        helpCenterId,
        defaultLocale,
        'current',
        {
            enabled: !!articleId,
        },
    )

    const {
        data: selectedQuestionData,
        isLoading: isFetchingQuestionLoading,
        isError: isFetchingQuestionError,
    } = useGetIngestedResource(
        {
            help_center_id: helpCenterId,
            id: articleData?.ingested_resource_id ?? 0,
        },
        {
            enabled:
                !!storeDomainIngestionLogId &&
                !!articleData?.ingested_resource_id,
        },
    )

    const selectedQuestion = useMemo(() => {
        return selectedQuestionData &&
            selectedQuestionData.article_ingestion_log_id ===
                storeDomainIngestionLogId
            ? {
                  ...selectedQuestionData,
                  web_pages: (selectedQuestionData?.web_pages as any[]).map(
                      (page) => ({
                          url: page.url,
                          title: page.title,
                          pageType: page.pageType,
                      }),
                  ),
              }
            : null
    }, [selectedQuestionData, storeDomainIngestionLogId])

    useEffect(() => {
        if (
            isFetchingArticleError ||
            (!!articleId &&
                !isFetchingArticleLoading &&
                !articleData?.ingested_resource_id)
        ) {
            void dispatch(
                notify({
                    message:
                        'Content no longer exists. It may have been deleted or moved.',
                    status: NotificationStatus.Error,
                }),
            )

            history.push(routes.questionsContent)
        }
    }, [
        isFetchingArticleError,
        articleId,
        isFetchingArticleLoading,
        articleData,
        dispatch,
        routes.questionsContent,
    ])

    return useMemo(() => {
        return {
            selectedQuestion,
            questionDetail: articleData,
            isError: isFetchingQuestionError || isFetchingArticleError,
            isLoading: isFetchingQuestionLoading || isFetchingArticleLoading,
        }
    }, [
        selectedQuestion,
        articleData,
        isFetchingQuestionError,
        isFetchingArticleError,
        isFetchingQuestionLoading,
        isFetchingArticleLoading,
    ])
}
