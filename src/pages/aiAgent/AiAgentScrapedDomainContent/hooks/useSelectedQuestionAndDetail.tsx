import { useEffect, useMemo } from 'react'

import useAppDispatch from 'hooks/useAppDispatch'
import {
    useGetHelpCenterArticle,
    useGetIngestedResource,
} from 'models/helpCenter/queries'
import { LocaleCode } from 'models/helpCenter/types'
import { useAiAgentNavigation } from 'pages/aiAgent/hooks/useAiAgentNavigation'
import history from 'pages/history'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

export const useSelectedQuestionAndDetail = ({
    shopName,
    helpCenterId,
    defaultLocale,
    selectedId,
    storeDomainIngestionLogId,
}: {
    shopName: string
    selectedId: number | null
    helpCenterId: number
    defaultLocale: LocaleCode
    storeDomainIngestionLogId: number | null
}) => {
    const dispatch = useAppDispatch()
    const { routes } = useAiAgentNavigation({ shopName })

    const {
        data: selectedQuestionData,
        isLoading: isFetchingQuestionLoading,
        isError: isFetchingQuestionError,
    } = useGetIngestedResource(
        {
            help_center_id: helpCenterId,
            id: selectedId ?? 0,
        },
        {
            enabled: !!selectedId && !!storeDomainIngestionLogId,
        },
    )

    const { data: articleData, isInitialLoading: isFetchingArticleLoading } =
        useGetHelpCenterArticle(
            selectedQuestionData?.article_id ?? 0,
            helpCenterId,
            defaultLocale,
            { enabled: !!selectedId && !!selectedQuestionData },
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
            isFetchingQuestionError ||
            (!!selectedId && !isFetchingQuestionLoading && !selectedQuestion)
        ) {
            void dispatch(
                notify({
                    message:
                        'Content no longer exists. It may have been deleted or moved.',
                    status: NotificationStatus.Error,
                }),
            )

            history.push(routes.pagesContent)
        }
    }, [
        isFetchingQuestionError,
        selectedId,
        isFetchingQuestionLoading,
        selectedQuestion,
        dispatch,
        routes.pagesContent,
    ])

    return useMemo(() => {
        return {
            selectedQuestion,
            questionDetail: articleData,
            isError: isFetchingQuestionError,
            isLoading: isFetchingQuestionLoading || isFetchingArticleLoading,
        }
    }, [
        selectedQuestion,
        articleData,
        isFetchingQuestionError,
        isFetchingQuestionLoading,
        isFetchingArticleLoading,
    ])
}
