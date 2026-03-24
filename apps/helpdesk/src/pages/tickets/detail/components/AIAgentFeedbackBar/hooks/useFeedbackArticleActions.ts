import { useCallback } from 'react'

import { logEvent, reportError, SegmentEvent } from '@repo/logging'

import useAppDispatch from 'hooks/useAppDispatch'
import type {
    Article,
    ArticleTemplateKey,
    CreateArticleDto,
    CreateArticleTranslationDto,
    LocaleCode,
} from 'models/helpCenter/types'
import { useKnowledgeTracking } from 'pages/aiAgent/hooks/useKnowledgeTracking'
import { useArticlesActions } from 'pages/settings/helpCenter/hooks/useArticlesActions'
import useCurrentHelpCenter from 'pages/settings/helpCenter/hooks/useCurrentHelpCenter'
import { useUpsertArticleTemplateReview } from 'pages/settings/helpCenter/queries'
import { getGenericMessageFromError } from 'pages/settings/helpCenter/utils'
import { isExistingArticle } from 'pages/settings/helpCenter/utils/helpCenter.utils'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

export const useFeedbackArticleActions = (
    selectedTemplateKey: ArticleTemplateKey | null,
    onArticleCreate: (article: Article) => void,
    onArticleUpdate: (article: Article) => void,
    onArticleDelete: (article: Article) => void,
    onArticleTranslationDelete: (deletedLocale: LocaleCode) => void,
) => {
    const dispatch = useAppDispatch()
    const helpCenter = useCurrentHelpCenter()
    const articlesActions = useArticlesActions()
    const reviewArticle = useUpsertArticleTemplateReview()

    const { onKnowledgeContentCreated, onKnowledgeContentEdited } =
        useKnowledgeTracking({ shopName: helpCenter?.shop_name ?? '' })

    const createArticle = useCallback(
        async (
            article: CreateArticleDto | Article | null,
            isPublished: boolean,
        ) => {
            if (!article?.translation) {
                return
            }

            try {
                const newArticle = await articlesActions.createArticle(
                    {
                        ...article.translation,
                        is_current: isPublished,
                    } as CreateArticleTranslationDto,
                    selectedTemplateKey,
                )

                onArticleCreate(newArticle)

                if (selectedTemplateKey) {
                    logEvent(
                        SegmentEvent.HelpCenterTemplatesArticleFromTemplateCreated,
                        {
                            template_key: selectedTemplateKey,
                        },
                    )
                }

                onKnowledgeContentCreated({
                    type: 'help-center-article',
                    createdFrom: 'ticket-view',
                    createdHow: !!selectedTemplateKey
                        ? 'from-template'
                        : 'from-scratch',
                })

                void dispatch(
                    notify({
                        message: `Article created${
                            isPublished ? ' and published' : ''
                        } with success`,
                        status: NotificationStatus.Success,
                    }),
                )
            } catch (err) {
                const errorMessage = getGenericMessageFromError(err)

                void dispatch(
                    notify({
                        message: `Failed to create the article: ${errorMessage}`,
                        status: NotificationStatus.Error,
                    }),
                )
                reportError(err as Error)
            }
        },
        [
            articlesActions,
            selectedTemplateKey,
            onArticleCreate,
            dispatch,
            onKnowledgeContentCreated,
        ],
    )

    const updateArticle = useCallback(
        async (article: Article | null, isPublished: boolean) => {
            if (!article?.translation) {
                return
            }

            const isAIArticle = article.template_key?.startsWith('ai_')
            const isAlreadyPublished = article.translation.is_current
            const updateAIArticleTemplateReview =
                isAIArticle && !isAlreadyPublished && isPublished

            try {
                const updatedArticle = await articlesActions.updateArticle(
                    helpCenter.default_locale,
                    {
                        ...article,
                        translation: {
                            ...article.translation,
                            is_current: isPublished,
                        },
                    },
                )

                onArticleUpdate(updatedArticle)

                if (updateAIArticleTemplateReview && article.template_key) {
                    await reviewArticle.mutateAsync([
                        undefined,
                        { help_center_id: helpCenter.id },
                        {
                            action: 'publish',
                            template_key: article.template_key,
                        },
                    ])
                }

                onKnowledgeContentEdited({
                    type: 'help-center-article',
                    editedFrom: 'ticket-view',
                })

                void dispatch(
                    notify({
                        message: `Article saved${
                            isPublished ? ' and published' : ''
                        } with success`,
                        status: NotificationStatus.Success,
                    }),
                )
            } catch (err) {
                const errorMessage = getGenericMessageFromError(err)

                void dispatch(
                    notify({
                        message: `Failed to save the article: ${errorMessage}`,
                        status: NotificationStatus.Error,
                    }),
                )
                reportError(err as Error)
            }
        },
        [
            articlesActions,
            helpCenter.default_locale,
            helpCenter.id,
            onArticleUpdate,
            reviewArticle,
            dispatch,
            onKnowledgeContentEdited,
        ],
    )

    const deleteArticle = useCallback(
        async (selectedArticle: Article | CreateArticleDto | null) => {
            if (!isExistingArticle(selectedArticle)) {
                return
            }

            try {
                await articlesActions.deleteArticle(selectedArticle.id)

                onArticleDelete(selectedArticle)

                void dispatch(
                    notify({
                        message: 'Article deleted with success',
                        status: NotificationStatus.Success,
                    }),
                )
            } catch (err) {
                void dispatch(
                    notify({
                        message: 'Failed to delete the article',
                        status: NotificationStatus.Error,
                    }),
                )
                reportError(err as Error)
            }
        },
        [articlesActions, dispatch, onArticleDelete],
    )

    const deleteArticleTranslation = useCallback(
        async (articleId: number, locale: LocaleCode) => {
            try {
                await articlesActions.deleteArticleTranslation(
                    articleId,
                    locale,
                )

                onArticleTranslationDelete(locale)

                void dispatch(
                    notify({
                        message: 'Article translation deleted with success',
                        status: NotificationStatus.Success,
                    }),
                )
            } catch (err) {
                void dispatch(
                    notify({
                        message: 'Failed to delete the article translation',
                        status: NotificationStatus.Error,
                    }),
                )
                reportError(err as Error)
            }
        },
        [articlesActions, dispatch, onArticleTranslationDelete],
    )

    return {
        isLoading: articlesActions.isLoading,
        createArticle,
        updateArticle,
        deleteArticle,
        deleteArticleTranslation,
    }
}
