import { useCallback } from 'react'

import { SentryTeam } from 'common/const/sentryTeamNames'
import {
    useBulkCopyArticles,
    useCopyArticle,
    useCreateArticle,
    useDeleteArticle,
    useDeleteArticleTranslationDraft,
    useUpdateArticleTranslation,
} from 'models/helpCenter/mutations'
import type { LocaleCode } from 'models/helpCenter/types'
import {
    mapGuidanceToArticleApi,
    mapUpdateGuidanceArticleToArticleApi,
} from 'pages/aiAgent/utils/guidance.utils'
import { reportError } from 'utils/errors'

import type { CreateGuidanceArticle, UpdateGuidanceArticle } from '../types'

export const useGuidanceArticleMutation = ({
    guidanceHelpCenterId,
}: {
    guidanceHelpCenterId: number
}) => {
    const {
        mutateAsync: createArticleMutateAsync,
        isLoading: isArticleCreationLoading,
    } = useCreateArticle(guidanceHelpCenterId)

    const {
        mutateAsync: deleteArticleMutateAsync,
        isLoading: isGuidanceArticleDeleting,
    } = useDeleteArticle(guidanceHelpCenterId)

    const {
        mutateAsync: updateArticleTranslationAsync,
        isLoading: isUpdateArticleTranslationLoading,
    } = useUpdateArticleTranslation(guidanceHelpCenterId)

    const { mutateAsync: copyArticleAsync, isLoading: isCopyArticleLoading } =
        useCopyArticle(guidanceHelpCenterId)

    const {
        mutateAsync: bulkCopyArticlesAsync,
        isLoading: isBulkCopyArticlesLoading,
    } = useBulkCopyArticles(guidanceHelpCenterId)

    const {
        mutateAsync: deleteArticleTranslationDraftAsync,
        isLoading: isDiscardingDraft,
    } = useDeleteArticleTranslationDraft(guidanceHelpCenterId)

    const createGuidanceArticle = useCallback(
        async (createGuidanceArticle: CreateGuidanceArticle) => {
            if (createGuidanceArticle.content === '') {
                throw new Error('Content is required for creating the article')
            }

            const payload = mapGuidanceToArticleApi(createGuidanceArticle)

            try {
                const article = await createArticleMutateAsync([
                    undefined,
                    { help_center_id: guidanceHelpCenterId },
                    payload,
                ])

                return article?.data
            } catch (error) {
                reportError(error, {
                    tags: { team: SentryTeam.CONVAI_KNOWLEDGE },
                    extra: {
                        context: 'Error during guidance article creation',
                    },
                })

                throw error
            }
        },
        [createArticleMutateAsync, guidanceHelpCenterId],
    )

    const updateGuidanceArticle = useCallback(
        async (
            updateGuidanceArticle: UpdateGuidanceArticle,
            { articleId, locale }: { articleId: number; locale: LocaleCode },
        ) => {
            if (updateGuidanceArticle.content === '') {
                throw new Error('Content is required for updating the article')
            }

            const payload = mapUpdateGuidanceArticleToArticleApi(
                updateGuidanceArticle,
            )

            try {
                const updatedArticle = await updateArticleTranslationAsync([
                    undefined,
                    {
                        article_id: articleId,
                        help_center_id: guidanceHelpCenterId,
                        locale,
                    },
                    payload,
                ])
                return updatedArticle?.data
            } catch (error) {
                reportError(error, {
                    tags: { team: SentryTeam.CONVAI_KNOWLEDGE },
                    extra: {
                        context: 'Error during guidance article updating',
                    },
                })

                throw error
            }
        },
        [guidanceHelpCenterId, updateArticleTranslationAsync],
    )

    const deleteGuidanceArticle = useCallback(
        async (articleId: number) => {
            try {
                await deleteArticleMutateAsync([
                    undefined,
                    { id: articleId, help_center_id: guidanceHelpCenterId },
                ])
            } catch (error) {
                reportError(error, {
                    tags: { team: SentryTeam.CONVAI_KNOWLEDGE },
                    extra: {
                        context: 'Error during guidance article deletion',
                    },
                })

                throw error
            }
        },
        [deleteArticleMutateAsync, guidanceHelpCenterId],
    )

    const duplicateGuidanceArticle = useCallback(
        async (articleId: number, shopName: string) => {
            try {
                await copyArticleAsync([
                    undefined,
                    { id: articleId, help_center_id: guidanceHelpCenterId },
                    shopName,
                ])
            } catch (error) {
                reportError(error, {
                    tags: { team: SentryTeam.CONVAI_KNOWLEDGE },
                    extra: {
                        context: 'Error during guidance article duplication',
                    },
                })

                throw error
            }
        },
        [copyArticleAsync, guidanceHelpCenterId],
    )

    const duplicate = useCallback(
        async (articleIds: number[], shopNames: string[]) => {
            try {
                await bulkCopyArticlesAsync([
                    undefined,
                    { help_center_id: guidanceHelpCenterId },
                    {
                        article_ids: articleIds,
                        shop_names: shopNames,
                    },
                ])
            } catch (error) {
                reportError(error, {
                    tags: { team: SentryTeam.CONVAI_KNOWLEDGE },
                    extra: {
                        context: 'Error during guidance article duplication',
                    },
                })

                throw error
            }
        },
        [bulkCopyArticlesAsync, guidanceHelpCenterId],
    )

    const discardGuidanceDraft = useCallback(
        async (articleId: number, locale: LocaleCode) => {
            try {
                const response = await deleteArticleTranslationDraftAsync([
                    undefined,
                    {
                        article_id: articleId,
                        help_center_id: guidanceHelpCenterId,
                        locale,
                    },
                ])

                return response?.data
            } catch (error) {
                reportError(error, {
                    tags: { team: SentryTeam.CONVAI_KNOWLEDGE },
                    extra: {
                        context: 'Error during guidance draft discard',
                    },
                })

                throw error
            }
        },
        [deleteArticleTranslationDraftAsync, guidanceHelpCenterId],
    )

    return {
        deleteGuidanceArticle,
        isGuidanceArticleDeleting,
        createGuidanceArticle,
        updateGuidanceArticle,
        isGuidanceArticleUpdating:
            isArticleCreationLoading ||
            isUpdateArticleTranslationLoading ||
            isCopyArticleLoading ||
            isBulkCopyArticlesLoading,
        duplicateGuidanceArticle,
        duplicate,
        discardGuidanceDraft,
        isDiscardingDraft,
    }
}
