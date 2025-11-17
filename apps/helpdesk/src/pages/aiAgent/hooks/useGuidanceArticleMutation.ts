import { useCallback } from 'react'

import { FeatureFlagKey } from '@repo/feature-flags'
import { useQueryClient } from '@tanstack/react-query'

import type { HttpResponse } from '@gorgias/helpdesk-queries'

import { SentryTeam } from 'common/const/sentryTeamNames'
import { useFlag } from 'core/flags'
import type { useGetMultipleHelpCenterArticleLists } from 'models/helpCenter/queries'
import {
    helpCenterKeys,
    useCopyArticle,
    useCreateArticle,
    useDeleteArticle,
    useUpdateArticleTranslation,
} from 'models/helpCenter/queries'
import type { LocaleCode } from 'models/helpCenter/types'
import {
    mapGuidanceToArticleApi,
    mapUpdateGuidanceArticleToArticleApi,
} from 'pages/aiAgent/utils/guidance.utils'
import { reportError } from 'utils/errors'

import type { CreateGuidanceArticle, UpdateGuidanceArticle } from '../types'
import { getGuidanceArticleQueryParams } from './useGuidanceArticles'

export const useGuidanceArticleMutation = ({
    guidanceHelpCenterId,
}: {
    guidanceHelpCenterId: number
}) => {
    const isIncreaseGuidanceCreationLimit = useFlag(
        FeatureFlagKey.IncreaseGuidanceCreationLimit,
    )
    const queryClient = useQueryClient()

    const guidanceArticleKeys = helpCenterKeys.articles(guidanceHelpCenterId)
    const guidanceArticleWithQueryParamsKeys = helpCenterKeys.articles(
        guidanceHelpCenterId,
        getGuidanceArticleQueryParams(isIncreaseGuidanceCreationLimit),
    )

    const {
        mutateAsync: createArticleMutateAsync,
        isLoading: isArticleCreationLoading,
    } = useCreateArticle({
        onMutate: async ([, , payload]) => {
            await queryClient.cancelQueries({
                queryKey: guidanceArticleKeys,
            })

            const optimisticArticle = {
                id: new Date().valueOf(),
                help_center_id: guidanceHelpCenterId,
                created_datetime: new Date().toISOString(),
                updated_datetime: new Date().toISOString(),
                translation: {
                    created_datetime: new Date().toISOString(),
                    updated_datetime: new Date().toISOString(),
                    ...payload.translation,
                },
            }

            queryClient.setQueryData<
                HttpResponse<
                    ReturnType<
                        typeof useGetMultipleHelpCenterArticleLists
                    >['articles']
                >
            >(guidanceArticleWithQueryParamsKeys, (old: any) => {
                if (!old?.data) return old
                return {
                    ...old,
                    data: [optimisticArticle, ...old.data],
                }
            })
        },

        onSettled: async () => {
            await queryClient.invalidateQueries({
                queryKey: guidanceArticleKeys,
            })
        },
    })

    const {
        mutateAsync: deleteArticleMutateAsync,
        isLoading: isGuidanceArticleDeleting,
    } = useDeleteArticle({
        onMutate: async ([, pathParams]) => {
            await queryClient.cancelQueries({
                queryKey: guidanceArticleKeys,
            })

            queryClient.setQueryData<
                HttpResponse<
                    ReturnType<
                        typeof useGetMultipleHelpCenterArticleLists
                    >['articles']
                >
            >(guidanceArticleWithQueryParamsKeys, (old: any) => {
                if (!old?.data) return old
                return {
                    ...old,
                    data: old.data.filter(
                        (article: any) => article.id !== pathParams.id,
                    ),
                }
            })
        },
        onSettled: async () => {
            await queryClient.invalidateQueries({
                queryKey: guidanceArticleKeys,
            })
        },
    })

    const {
        mutateAsync: updateArticleTranslationAsync,
        isLoading: isUpdateArticleTranslationLoading,
    } = useUpdateArticleTranslation({
        onMutate: async ([, pathParams, updatedData]) => {
            await queryClient.cancelQueries({
                queryKey: guidanceArticleKeys,
            })

            queryClient.setQueryData<
                HttpResponse<
                    ReturnType<
                        typeof useGetMultipleHelpCenterArticleLists
                    >['articles']
                >
            >(guidanceArticleWithQueryParamsKeys, (old) => {
                if (!old?.data) return old

                return {
                    ...old,
                    data: old.data.map((article) => {
                        return article.id === pathParams.article_id
                            ? {
                                  ...article,
                                  translation: {
                                      ...article.translation,
                                      ...updatedData,
                                  },
                              }
                            : article
                    }),
                }
            })
        },

        onSettled: async () => {
            await queryClient.invalidateQueries({
                queryKey: guidanceArticleKeys,
            })
        },
    })

    const { mutateAsync: copyArticleAsync, isLoading: isCopyArticleLoading } =
        useCopyArticle({
            onSuccess: async () => {
                await queryClient.invalidateQueries({
                    queryKey: helpCenterKeys.articles(guidanceHelpCenterId),
                })
            },
        })

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

    return {
        deleteGuidanceArticle,
        isGuidanceArticleDeleting,
        createGuidanceArticle,
        updateGuidanceArticle,
        isGuidanceArticleUpdating:
            isArticleCreationLoading ||
            isUpdateArticleTranslationLoading ||
            isCopyArticleLoading,
        duplicateGuidanceArticle,
    }
}
