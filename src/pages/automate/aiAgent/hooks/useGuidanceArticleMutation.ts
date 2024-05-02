import {useQueryClient} from '@tanstack/react-query'
import {useCallback} from 'react'
import {AI_AGENT_SENTRY_TEAM} from 'common/const/sentryTeamNames'
import {
    useCreateArticle,
    helpCenterStatsKeys,
    useDeleteArticle,
    useUpdateArticleTranslation,
} from 'models/helpCenter/queries'
import {reportError} from 'utils/errors'
import {LocaleCode} from 'models/helpCenter/types'
import {CreateGuidanceArticle, UpdateGuidanceArticle} from '../types'
import {
    mapGuidanceToArticleApi,
    mapUpdateGuidanceArticleToArticleApi,
} from '../utils/guidance.utils'

export const useGuidanceArticleMutation = ({
    guidanceHelpCenterId,
}: {
    guidanceHelpCenterId: number
}) => {
    const queryClient = useQueryClient()
    const {
        mutateAsync: createArticleMutateAsync,
        isLoading: isArticleCreationLoading,
    } = useCreateArticle({
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: helpCenterStatsKeys.articles(guidanceHelpCenterId),
            })
        },
    })

    const {
        mutateAsync: deleteArticleMutateAsync,
        isLoading: isGuidanceArticleDeleting,
    } = useDeleteArticle({
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: helpCenterStatsKeys.articles(guidanceHelpCenterId),
            })
        },
    })

    const {
        mutateAsync: updateArticleTranslationAsync,
        isLoading: isUpdateArticleTranslationLoading,
    } = useUpdateArticleTranslation({
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: helpCenterStatsKeys.articles(guidanceHelpCenterId),
            })
        },
    })

    const createGuidanceArticle = useCallback(
        async (createGuidanceArticle: CreateGuidanceArticle) => {
            const payload = mapGuidanceToArticleApi(createGuidanceArticle)

            try {
                await createArticleMutateAsync([
                    undefined,
                    {help_center_id: guidanceHelpCenterId},
                    payload,
                ])
            } catch (error) {
                reportError(error, {
                    extra: {
                        context: 'Error during guidance article creation',
                        tags: [AI_AGENT_SENTRY_TEAM],
                    },
                })

                throw error
            }
        },
        [createArticleMutateAsync, guidanceHelpCenterId]
    )

    const updateGuidanceArticle = useCallback(
        async (
            updateGuidanceArticle: UpdateGuidanceArticle,
            {articleId, locale}: {articleId: number; locale: LocaleCode}
        ) => {
            const payload = mapUpdateGuidanceArticleToArticleApi(
                updateGuidanceArticle
            )

            try {
                await updateArticleTranslationAsync([
                    undefined,
                    {
                        article_id: articleId,
                        help_center_id: guidanceHelpCenterId,
                        locale,
                    },
                    payload,
                ])
            } catch (error) {
                reportError(error, {
                    extra: {
                        context: 'Error during guidance article updating',
                        tags: [AI_AGENT_SENTRY_TEAM],
                    },
                })

                throw error
            }
        },
        [guidanceHelpCenterId, updateArticleTranslationAsync]
    )

    const deleteGuidanceArticle = useCallback(
        async (articleId: number) => {
            try {
                await deleteArticleMutateAsync([
                    undefined,
                    {id: articleId, help_center_id: guidanceHelpCenterId},
                ])
            } catch (error) {
                reportError(error, {
                    extra: {
                        context: 'Error during guidance article deletion',
                        tags: [AI_AGENT_SENTRY_TEAM],
                    },
                })

                throw error
            }
        },
        [deleteArticleMutateAsync, guidanceHelpCenterId]
    )

    return {
        deleteGuidanceArticle,
        isGuidanceArticleDeleting,
        createGuidanceArticle,
        updateGuidanceArticle,
        isGuidanceArticleUpdating:
            isArticleCreationLoading || isUpdateArticleTranslationLoading,
    }
}
