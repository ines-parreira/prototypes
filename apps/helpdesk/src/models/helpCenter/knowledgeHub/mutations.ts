import { useQueryClient } from '@tanstack/react-query'

import {
    helpCenterKeys,
    useBulkDeleteArticles,
    useBulkUpdateArticleTranslationVisibility,
    useCreateArticle,
    useDeleteArticle,
    useUpdateArticleTranslation,
} from 'models/helpCenter/queries'
import type {
    KnowledgeHubArticle,
    KnowledgeHubArticlesQueryParams,
    KnowledgeHubArticlesResponse,
} from 'models/helpCenter/types'
import {
    KnowledgeHubArticleSourceType,
    VisibilityStatusEnum,
} from 'models/helpCenter/types'

type AdditionalCallbacks<TData = unknown, TError = unknown> = {
    onSuccess?: (data: TData) => void | Promise<void>
    onError?: (error: TError) => void | Promise<void>
    onSettled?: () => void | Promise<void>
}

type MutationContext = {
    previousArticles?: KnowledgeHubArticlesResponse
}

/**
 * Hook for creating articles with optimistic updates to Knowledge Hub cache
 * Updates the knowledgeHubArticles query cache immediately
 */
export const useKnowledgeHubCreateArticle = (
    helpCenterId: number,
    queryParams: KnowledgeHubArticlesQueryParams,
    callbacks?: AdditionalCallbacks,
) => {
    const queryClient = useQueryClient()
    const knowledgeHubKey = helpCenterKeys.knowledgeHubArticles(queryParams)

    return useCreateArticle({
        onMutate: async (variables): Promise<MutationContext> => {
            const [, , payload] = variables

            await queryClient.cancelQueries({
                queryKey: knowledgeHubKey,
            })

            const previousArticles =
                queryClient.getQueryData<KnowledgeHubArticlesResponse>(
                    knowledgeHubKey,
                )

            const tempId = Date.now() + Math.floor(Math.random() * 1000)
            const nowIso = new Date().toISOString()
            const { translation } = payload

            const optimisticArticle: KnowledgeHubArticle = {
                id: tempId,
                title: translation.title,
                source: '',
                localeCode: translation.locale,
                visibilityStatus:
                    translation.visibility_status ??
                    VisibilityStatusEnum.UNLISTED,
                shopName: null,
                createdDatetime: nowIso,
                updatedDatetime: nowIso,
                type: KnowledgeHubArticleSourceType.GuidanceHelpCenter,
                draftVersionId: null,
                publishedVersionId: null,
            }

            queryClient.setQueryData<KnowledgeHubArticlesResponse>(
                knowledgeHubKey,
                (old) => {
                    if (!old?.articles) return old
                    return {
                        ...old,
                        articles: [optimisticArticle, ...old.articles],
                    }
                },
            )

            return { previousArticles }
        },
        onError: async (error, _variables, context) => {
            const typedContext = context as MutationContext
            if (typedContext?.previousArticles) {
                queryClient.setQueryData(
                    knowledgeHubKey,
                    typedContext.previousArticles,
                )
            }
            await callbacks?.onError?.(error)
        },
        onSuccess: async (data) => {
            await callbacks?.onSuccess?.(data)
        },
        onSettled: async () => {
            await queryClient.invalidateQueries({
                queryKey: knowledgeHubKey,
            })
            await callbacks?.onSettled?.()
        },
    })
}

/**
 * Hook for updating articles with optimistic updates to Knowledge Hub cache
 * Preserves metrics and updates specific article in place
 */
export const useKnowledgeHubUpdateArticle = (
    helpCenterId: number,
    queryParams: KnowledgeHubArticlesQueryParams,
    callbacks?: AdditionalCallbacks,
) => {
    const queryClient = useQueryClient()
    const knowledgeHubKey = helpCenterKeys.knowledgeHubArticles(queryParams)

    return useUpdateArticleTranslation({
        onMutate: async (variables): Promise<MutationContext> => {
            const [, pathParams, updatedData] = variables

            await queryClient.cancelQueries({
                queryKey: knowledgeHubKey,
            })

            const previousArticles =
                queryClient.getQueryData<KnowledgeHubArticlesResponse>(
                    knowledgeHubKey,
                )

            queryClient.setQueryData<KnowledgeHubArticlesResponse>(
                knowledgeHubKey,
                (old) => {
                    if (!old?.articles) return old
                    return {
                        ...old,
                        articles: old.articles.map((article) => {
                            if (article.id === pathParams.article_id) {
                                return {
                                    ...article,
                                    title: updatedData.title ?? article.title,
                                    visibilityStatus:
                                        updatedData.visibility_status ??
                                        article.visibilityStatus,
                                    updatedDatetime: new Date().toISOString(),
                                }
                            }
                            return article
                        }),
                    }
                },
            )

            return { previousArticles }
        },
        onError: async (error, _variables, context) => {
            const typedContext = context as MutationContext
            if (typedContext?.previousArticles) {
                queryClient.setQueryData(
                    knowledgeHubKey,
                    typedContext.previousArticles,
                )
            }
            await callbacks?.onError?.(error)
        },
        onSuccess: async (data) => {
            await callbacks?.onSuccess?.(data)
        },
        onSettled: async () => {
            await queryClient.invalidateQueries({
                queryKey: knowledgeHubKey,
            })
            await callbacks?.onSettled?.()
        },
    })
}

/**
 * Hook for deleting articles with optimistic updates to Knowledge Hub cache
 * Removes article from cache immediately
 */
export const useKnowledgeHubDeleteArticle = (
    helpCenterId: number,
    queryParams: KnowledgeHubArticlesQueryParams,
    callbacks?: AdditionalCallbacks,
) => {
    const queryClient = useQueryClient()
    const knowledgeHubKey = helpCenterKeys.knowledgeHubArticles(queryParams)

    return useDeleteArticle({
        onMutate: async (variables): Promise<MutationContext> => {
            const [, pathParams] = variables

            await queryClient.cancelQueries({
                queryKey: knowledgeHubKey,
            })

            const previousArticles =
                queryClient.getQueryData<KnowledgeHubArticlesResponse>(
                    knowledgeHubKey,
                )

            queryClient.setQueryData<KnowledgeHubArticlesResponse>(
                knowledgeHubKey,
                (old) => {
                    if (!old?.articles) return old
                    return {
                        ...old,
                        articles: old.articles.filter(
                            (article) => article.id !== pathParams.id,
                        ),
                    }
                },
            )

            return { previousArticles }
        },
        onError: async (error, _variables, context) => {
            const typedContext = context as MutationContext
            if (typedContext?.previousArticles) {
                queryClient.setQueryData(
                    knowledgeHubKey,
                    typedContext.previousArticles,
                )
            }
            await callbacks?.onError?.(error)
        },
        onSuccess: async (data) => {
            await callbacks?.onSuccess?.(data)
        },
        onSettled: async () => {
            await queryClient.invalidateQueries({
                queryKey: knowledgeHubKey,
            })
            await callbacks?.onSettled?.()
        },
    })
}

/**
 * Hook for bulk deleting articles with optimistic updates to Knowledge Hub cache
 * Removes multiple articles from cache immediately
 */
export const useKnowledgeHubBulkDelete = (
    queryParams: KnowledgeHubArticlesQueryParams,
    callbacks?: AdditionalCallbacks,
) => {
    const queryClient = useQueryClient()
    const knowledgeHubKey = helpCenterKeys.knowledgeHubArticles(queryParams)

    return useBulkDeleteArticles({
        onMutate: async (variables): Promise<MutationContext> => {
            const [, , body] = variables
            const articleIdsToDelete = body.article_ids

            await queryClient.cancelQueries({
                queryKey: knowledgeHubKey,
            })

            const previousArticles =
                queryClient.getQueryData<KnowledgeHubArticlesResponse>(
                    knowledgeHubKey,
                )

            queryClient.setQueryData<KnowledgeHubArticlesResponse>(
                knowledgeHubKey,
                (old) => {
                    if (!old?.articles) return old
                    return {
                        ...old,
                        articles: old.articles.filter(
                            (article) =>
                                !articleIdsToDelete.includes(article.id),
                        ),
                    }
                },
            )

            return { previousArticles }
        },
        onError: async (error, _variables, context) => {
            const typedContext = context as MutationContext
            if (typedContext?.previousArticles) {
                queryClient.setQueryData(
                    knowledgeHubKey,
                    typedContext.previousArticles,
                )
            }
            await callbacks?.onError?.(error)
        },
        onSuccess: async (data) => {
            await callbacks?.onSuccess?.(data)
        },
        onSettled: async () => {
            await queryClient.invalidateQueries({
                queryKey: knowledgeHubKey,
            })
            await callbacks?.onSettled?.()
        },
    })
}

/**
 * Hook for bulk updating article visibility with optimistic updates to Knowledge Hub cache
 * Updates inUseByAI property for multiple articles immediately
 */
export const useKnowledgeHubBulkUpdateVisibility = (
    queryParams: KnowledgeHubArticlesQueryParams,
    callbacks?: AdditionalCallbacks,
) => {
    const queryClient = useQueryClient()
    const knowledgeHubKey = helpCenterKeys.knowledgeHubArticles(queryParams)

    return useBulkUpdateArticleTranslationVisibility({
        onMutate: async (variables): Promise<MutationContext> => {
            const [, , body] = variables
            const { article_ids: articleIds, visibility_status } = body

            await queryClient.cancelQueries({
                queryKey: knowledgeHubKey,
            })

            const previousArticles =
                queryClient.getQueryData<KnowledgeHubArticlesResponse>(
                    knowledgeHubKey,
                )

            queryClient.setQueryData<KnowledgeHubArticlesResponse>(
                knowledgeHubKey,
                (old) => {
                    if (!old?.articles) return old
                    return {
                        ...old,
                        articles: old.articles.map((article) => {
                            if (articleIds.includes(article.id)) {
                                return {
                                    ...article,
                                    visibilityStatus: visibility_status,
                                    updatedDatetime: new Date().toISOString(),
                                }
                            }
                            return article
                        }),
                    }
                },
            )

            return { previousArticles }
        },
        onError: async (error, _variables, context) => {
            const typedContext = context as MutationContext
            if (typedContext?.previousArticles) {
                queryClient.setQueryData(
                    knowledgeHubKey,
                    typedContext.previousArticles,
                )
            }
            await callbacks?.onError?.(error)
        },
        onSuccess: async (data) => {
            await callbacks?.onSuccess?.(data)
        },
        onSettled: async () => {
            await queryClient.invalidateQueries({
                queryKey: knowledgeHubKey,
            })
            await callbacks?.onSettled?.()
        },
    })
}
