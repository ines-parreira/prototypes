import { useCallback, useEffect, useState } from 'react'

import { logEvent, SegmentEvent } from '@repo/logging'
import { useQueryClient } from '@tanstack/react-query'

import useAppDispatch from 'hooks/useAppDispatch'
import type {
    AIArticle,
    ArticleTemplateReviewAction,
    LocaleCode,
} from 'models/helpCenter/types'
import { useCreateAIArticle } from 'pages/settings/helpCenter/hooks/useCreateAIArticle'
import { useGetAIArticles } from 'pages/settings/helpCenter/hooks/useGetAIArticles'
import {
    aiArticleKeys,
    useUpsertArticleTemplateReview,
} from 'pages/settings/helpCenter/queries'
import type { ArticleOrigin } from 'pages/settings/helpCenter/types/articleOrigin.enum'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

export const useTopQuestionsArticles = (
    storeIntegrationId: number,
    helpCenterId: number,
    locale: LocaleCode,
) => {
    const appDispatch = useAppDispatch()
    const queryClient = useQueryClient()

    const { fetchedArticles, isLoading } = useGetAIArticles({
        helpCenterId,
        storeIntegrationId,
        locale,
    })

    const { createArticle: createArticleMutation } = useCreateAIArticle(
        helpCenterId,
        locale,
    )

    const [articles, setArticles] = useState<AIArticle[]>([])

    useEffect(() => {
        if (!isLoading) {
            setArticles(fetchedArticles || [])
        }
    }, [fetchedArticles, isLoading])

    const reviewArticle = useUpsertArticleTemplateReview({
        onSuccess: () =>
            Promise.all([
                queryClient.invalidateQueries(aiArticleKeys.list(helpCenterId)),
                queryClient.invalidateQueries(
                    aiArticleKeys.listWithStore(
                        helpCenterId,
                        storeIntegrationId,
                    ),
                ),
            ]),
    })

    const updateReviewLocally = useCallback(
        (
            templateKey: string,
            action: ArticleTemplateReviewAction,
            reason?: string,
        ) => {
            setArticles((prevArticles) =>
                prevArticles.map((article) =>
                    article.key === templateKey
                        ? {
                              ...article,
                              review_action: action,
                              reviews: [
                                  ...(article.reviews ?? []),
                                  {
                                      template_key: templateKey,
                                      action,
                                      reason,
                                      help_center_id: helpCenterId,
                                  },
                              ],
                          }
                        : article,
                ),
            )
        },
        [setArticles, helpCenterId],
    )

    const dismissArticle = useCallback(
        async (templateKey: string): Promise<void> => {
            updateReviewLocally(templateKey, 'dismissFromTopQuestions')

            try {
                await reviewArticle.mutateAsync([
                    undefined,
                    { help_center_id: helpCenterId },
                    {
                        action: 'dismissFromTopQuestions',
                        template_key: templateKey,
                    },
                ])

                logEvent(SegmentEvent.AutomateTopQuestionsSectionDismissArticle)
            } catch {
                void appDispatch(
                    notify({
                        message: `An unexpected error occurred. Please try again later.`,
                        status: NotificationStatus.Error,
                    }),
                )
            }
        },
        [reviewArticle, helpCenterId, updateReviewLocally, appDispatch],
    )

    const createArticle = useCallback(
        async (templateKey: string, origin: ArticleOrigin): Promise<void> => {
            const articleTemplate = articles.find(
                ({ key }) => key === templateKey,
            )

            if (!articleTemplate) {
                return
            }

            let createdArticle: { data: { id: number } } | null

            try {
                createdArticle = await createArticleMutation({
                    articleTemplate,
                    customerVisibility: 'PUBLIC',
                    categoryId: null,
                    publish: false,
                    origin,
                })
            } catch {
                void appDispatch(
                    notify({
                        message: `Article could not be created. Please try again later`,
                        status: NotificationStatus.Error,
                    }),
                )

                return
            }

            if (!createdArticle) {
                return
            }

            await reviewArticle.mutateAsync([
                undefined,
                { help_center_id: helpCenterId },
                {
                    action: 'saveAsDraft',
                    template_key: templateKey,
                },
            ])

            updateReviewLocally(templateKey, 'saveAsDraft')

            window.open(
                `/app/settings/help-center/${helpCenterId}/articles?article_id=${createdArticle.data.id}`,
                '_blank',
                'noopener',
            )
        },
        [
            createArticleMutation,
            articles,
            reviewArticle,
            helpCenterId,
            updateReviewLocally,
            appDispatch,
        ],
    )

    return {
        articles,
        isLoading: isLoading,
        dismissArticle,
        createArticle,
    }
}
