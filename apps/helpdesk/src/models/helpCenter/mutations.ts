import { useMutation, useQueryClient } from '@tanstack/react-query'

import type { HelpCenterClient } from 'rest_api/help_center_api/client'
import type { Paths } from 'rest_api/help_center_api/client.generated'

import { useHelpCenterApi } from '../../pages/settings/helpCenter/hooks/useHelpCenterApi'
import { helpCenterKeys } from './queries'
import {
    bulkCopyArticles,
    bulkDeleteArticles,
    bulkUpdateArticleTranslationVisibility,
    copyArticle,
    createArticle,
    createArticleTranslation,
    deleteArticle,
    deleteArticleTranslation,
    deleteArticleTranslationDraft,
    updateArticleTranslation,
} from './resources'

type ArticleListData = NonNullable<
    Awaited<ReturnType<typeof import('./resources').getHelpCenterArticles>>
>

type AdditionalCallbacks<TData = unknown, TError = unknown> = {
    onSuccess?: (data: TData) => void | Promise<void>
    onError?: (error: TError) => void | Promise<void>
    onSettled?: () => void | Promise<void>
}

type OptimisticContext = {
    previousArticles?: ArticleListData
}

export const useCreateArticle = (
    helpCenterId: number,
    callbacks?: AdditionalCallbacks<
        Awaited<ReturnType<typeof createArticle>>,
        unknown
    >,
) => {
    const queryClient = useQueryClient()
    const { client: helpCenterClient } = useHelpCenterApi()

    const articleListKey = helpCenterKeys.articles(helpCenterId)

    return useMutation<
        Awaited<ReturnType<typeof createArticle>>,
        unknown,
        Parameters<typeof createArticle>,
        OptimisticContext
    >({
        mutationFn: ([client = helpCenterClient, pathParams, data]) =>
            createArticle(client, pathParams, data),
        onMutate: async ([, , payload]) => {
            await queryClient.cancelQueries({
                queryKey: articleListKey,
            })

            const previousArticles =
                queryClient.getQueryData<ArticleListData>(articleListKey)

            const tempId = Date.now()
            const tempUnlistedId = `temp-${tempId}`
            const nowIso = new Date().toISOString()
            const { translation } = payload

            const optimisticArticle: ArticleListData['data'][number] = {
                id: tempId,
                unlisted_id: tempUnlistedId,
                help_center_id: helpCenterId,
                category_id: translation.category_id ?? null,
                ingested_resource_id: null,
                available_locales: [translation.locale],
                rating: { up: 0, down: 0 },
                created_datetime: nowIso,
                updated_datetime: nowIso,
                translation: {
                    locale: translation.locale,
                    title: translation.title,
                    content: translation.content,
                    excerpt: translation.excerpt,
                    slug: translation.slug,
                    seo_meta: translation.seo_meta,
                    is_current: translation.is_current ?? false,
                    visibility_status:
                        translation.visibility_status ?? 'UNLISTED',
                    customer_visibility: translation.customer_visibility,
                    article_id: tempId,
                    article_unlisted_id: tempUnlistedId,
                    draft_version_id: null,
                    published_version_id: null,
                    published_datetime: null,
                    publisher_user_id: null,
                    commit_message: null,
                    version: null,
                    rating: { up: 0, down: 0 },
                    category_id: translation.category_id ?? null,
                    created_datetime: nowIso,
                    updated_datetime: nowIso,
                },
            }

            queryClient.setQueryData<ArticleListData>(articleListKey, (old) => {
                if (!old?.data) return old
                return {
                    ...old,
                    data: [optimisticArticle, ...old.data],
                }
            })

            return { previousArticles }
        },
        onSuccess: async (data) => {
            await callbacks?.onSuccess?.(data)
        },
        onError: async (error, _variables, context) => {
            if (context?.previousArticles) {
                queryClient.setQueryData(
                    articleListKey,
                    context.previousArticles,
                )
            }
            await callbacks?.onError?.(error)
        },
        onSettled: async () => {
            await queryClient.invalidateQueries({
                queryKey: articleListKey,
            })
            await callbacks?.onSettled?.()
        },
    })
}

export const useDeleteArticle = (
    helpCenterId: number,
    callbacks?: AdditionalCallbacks<
        Awaited<ReturnType<typeof deleteArticle>>,
        unknown
    >,
) => {
    const queryClient = useQueryClient()
    const { client: helpCenterClient } = useHelpCenterApi()

    const articleListKey = helpCenterKeys.articles(helpCenterId)

    return useMutation<
        Awaited<ReturnType<typeof deleteArticle>>,
        unknown,
        Parameters<typeof deleteArticle>,
        OptimisticContext
    >({
        mutationFn: ([client = helpCenterClient, pathParams]) =>
            deleteArticle(client, pathParams),
        onMutate: async ([, pathParams]) => {
            await queryClient.cancelQueries({
                queryKey: articleListKey,
            })

            const previousArticles =
                queryClient.getQueryData<ArticleListData>(articleListKey)

            queryClient.setQueryData<ArticleListData>(articleListKey, (old) => {
                if (!old?.data) return old
                return {
                    ...old,
                    data: old.data.filter(
                        (article) => article.id !== pathParams.id,
                    ),
                }
            })

            return { previousArticles }
        },
        onSuccess: async (data) => {
            await callbacks?.onSuccess?.(data)
        },
        onError: async (error, _variables, context) => {
            if (context?.previousArticles) {
                queryClient.setQueryData(
                    articleListKey,
                    context.previousArticles,
                )
            }
            await callbacks?.onError?.(error)
        },
        onSettled: async (_data, _error, variables) => {
            const [, pathParams] = variables
            if (pathParams.id) {
                await queryClient.invalidateQueries({
                    queryKey: helpCenterKeys.article(
                        helpCenterId,
                        pathParams.id,
                    ),
                    refetchType: 'none',
                })
            }
            await queryClient.invalidateQueries({
                queryKey: articleListKey,
                exact: true,
            })
            await callbacks?.onSettled?.()
        },
    })
}

export const useUpdateArticleTranslation = (
    helpCenterId: number,
    callbacks?: AdditionalCallbacks<
        Awaited<ReturnType<typeof updateArticleTranslation>>,
        unknown
    >,
) => {
    const queryClient = useQueryClient()
    const { client: helpCenterClient } = useHelpCenterApi()

    const articleListKey = helpCenterKeys.articles(helpCenterId)

    return useMutation<
        Awaited<ReturnType<typeof updateArticleTranslation>>,
        unknown,
        Parameters<typeof updateArticleTranslation>,
        OptimisticContext
    >({
        mutationFn: ([client = helpCenterClient, pathParams, data]) =>
            updateArticleTranslation(client, pathParams, data),
        onMutate: async ([, pathParams, updatedData]) => {
            await queryClient.cancelQueries({
                queryKey: articleListKey,
            })

            const previousArticles =
                queryClient.getQueryData<ArticleListData>(articleListKey)

            queryClient.setQueryData<ArticleListData>(articleListKey, (old) => {
                if (!old?.data) return old
                return {
                    ...old,
                    data: old.data.map((article) =>
                        article.id === pathParams.article_id
                            ? {
                                  ...article,
                                  translation: {
                                      ...article.translation,
                                      ...updatedData,
                                  },
                              }
                            : article,
                    ),
                }
            })

            return { previousArticles }
        },
        onSuccess: async (data) => {
            await callbacks?.onSuccess?.(data)
        },
        onError: async (error, _variables, context) => {
            if (context?.previousArticles) {
                queryClient.setQueryData(
                    articleListKey,
                    context.previousArticles,
                )
            }
            await callbacks?.onError?.(error)
        },
        onSettled: async (_data, _error, variables) => {
            const [, pathParams] = variables
            if (pathParams.article_id) {
                await queryClient.invalidateQueries({
                    queryKey: helpCenterKeys.article(
                        helpCenterId,
                        pathParams.article_id,
                    ),
                })
            }
            await queryClient.invalidateQueries({
                predicate: (query) => {
                    const key = query.queryKey as readonly unknown[]
                    return (
                        key[0] === 'help-center' &&
                        key[1] === helpCenterId &&
                        key[2] === 'articles' &&
                        typeof key[3] !== 'number'
                    )
                },
            })
            await callbacks?.onSettled?.()
        },
    })
}

export const useCreateArticleTranslation = (
    helpCenterId: number,
    callbacks?: AdditionalCallbacks<
        Awaited<ReturnType<typeof createArticleTranslation>>,
        unknown
    >,
) => {
    const queryClient = useQueryClient()
    const { client: helpCenterClient } = useHelpCenterApi()

    const articleListKey = helpCenterKeys.articles(helpCenterId)

    return useMutation({
        mutationFn: ([client = helpCenterClient, pathParams, data]: Parameters<
            typeof createArticleTranslation
        >) => createArticleTranslation(client, pathParams, data),
        onSuccess: async (data) => {
            await callbacks?.onSuccess?.(data)
        },
        onError: async (error) => {
            await callbacks?.onError?.(error)
        },
        onSettled: async (
            _data,
            _error,
            variables: Parameters<typeof createArticleTranslation>,
        ) => {
            const [, pathParams] = variables
            if (pathParams.article_id) {
                await queryClient.invalidateQueries({
                    queryKey: helpCenterKeys.article(
                        helpCenterId,
                        pathParams.article_id,
                    ),
                })
            }
            await queryClient.invalidateQueries({
                queryKey: articleListKey,
            })
            await callbacks?.onSettled?.()
        },
    })
}

export const useDeleteArticleTranslation = (
    helpCenterId: number,
    callbacks?: AdditionalCallbacks<
        Awaited<ReturnType<typeof deleteArticleTranslation>>,
        unknown
    >,
) => {
    const queryClient = useQueryClient()
    const { client: helpCenterClient } = useHelpCenterApi()

    const articleListKey = helpCenterKeys.articles(helpCenterId)

    return useMutation({
        mutationFn: ([client = helpCenterClient, pathParams]: Parameters<
            typeof deleteArticleTranslation
        >) => deleteArticleTranslation(client, pathParams),
        onSuccess: async (data) => {
            await callbacks?.onSuccess?.(data)
        },
        onError: async (error) => {
            await callbacks?.onError?.(error)
        },
        onSettled: async (
            _data,
            _error,
            variables: Parameters<typeof deleteArticleTranslation>,
        ) => {
            const [, pathParams] = variables
            if (pathParams.article_id) {
                await queryClient.invalidateQueries({
                    queryKey: helpCenterKeys.article(
                        helpCenterId,
                        pathParams.article_id,
                    ),
                })
            }
            await queryClient.invalidateQueries({
                queryKey: articleListKey,
            })
            await callbacks?.onSettled?.()
        },
    })
}

export const useDeleteArticleTranslationDraft = (
    helpCenterId: number,
    callbacks?: AdditionalCallbacks<
        Awaited<ReturnType<typeof deleteArticleTranslationDraft>>,
        unknown
    >,
) => {
    const queryClient = useQueryClient()
    const { client: helpCenterClient } = useHelpCenterApi()

    const articleListKey = helpCenterKeys.articles(helpCenterId)

    return useMutation({
        mutationFn: ([client = helpCenterClient, pathParams]: Parameters<
            typeof deleteArticleTranslationDraft
        >) => deleteArticleTranslationDraft(client, pathParams),
        onSuccess: async (data) => {
            await callbacks?.onSuccess?.(data)
        },
        onError: async (error) => {
            await callbacks?.onError?.(error)
        },
        onSettled: async (
            _data,
            _error,
            variables: Parameters<typeof deleteArticleTranslationDraft>,
        ) => {
            const [, pathParams] = variables
            if (pathParams.article_id) {
                await queryClient.invalidateQueries({
                    queryKey: helpCenterKeys.article(
                        helpCenterId,
                        pathParams.article_id,
                    ),
                })
            }
            await queryClient.invalidateQueries({
                queryKey: articleListKey,
            })
            await callbacks?.onSettled?.()
        },
    })
}

export const useCopyArticle = (
    helpCenterId: number,
    callbacks?: AdditionalCallbacks<
        Awaited<ReturnType<typeof copyArticle>>,
        unknown
    >,
) => {
    const queryClient = useQueryClient()
    const { client: helpCenterClient } = useHelpCenterApi()

    const articleListKey = helpCenterKeys.articles(helpCenterId)

    return useMutation({
        mutationFn: ([client = helpCenterClient, pathParams, data]: Parameters<
            typeof copyArticle
        >) => copyArticle(client, pathParams, data),
        onSuccess: async (data) => {
            await callbacks?.onSuccess?.(data)
        },
        onError: async (error) => {
            await callbacks?.onError?.(error)
        },
        onSettled: async () => {
            await queryClient.invalidateQueries({
                queryKey: articleListKey,
            })
            await callbacks?.onSettled?.()
        },
    })
}

export const useBulkDeleteArticles = (
    helpCenterId: number,
    callbacks?: AdditionalCallbacks<
        Awaited<ReturnType<typeof bulkDeleteArticles>>,
        unknown
    >,
) => {
    const queryClient = useQueryClient()
    const { client: helpCenterClient } = useHelpCenterApi()

    const articleListKey = helpCenterKeys.articles(helpCenterId)

    return useMutation({
        mutationFn: ([client = helpCenterClient, pathParams, body]: [
            client: HelpCenterClient | undefined,
            pathParams: { help_center_id: number },
            body: { article_ids: number[] },
        ]) => bulkDeleteArticles(client, pathParams, body),
        onSuccess: async (data) => {
            await callbacks?.onSuccess?.(data)
        },
        onError: async (error) => {
            await callbacks?.onError?.(error)
        },
        onSettled: async () => {
            await queryClient.invalidateQueries({
                queryKey: articleListKey,
            })
            await callbacks?.onSettled?.()
        },
    })
}

export const useBulkCopyArticles = (
    helpCenterId: number,
    callbacks?: AdditionalCallbacks<
        Awaited<ReturnType<typeof bulkCopyArticles>>,
        unknown
    >,
) => {
    const queryClient = useQueryClient()
    const { client: helpCenterClient } = useHelpCenterApi()

    const articleListKey = helpCenterKeys.articles(helpCenterId)

    return useMutation({
        mutationFn: ([client = helpCenterClient, pathParams, body]: [
            client: HelpCenterClient | undefined,
            pathParams: Paths.BulkCopyArticles.PathParameters,
            body: Paths.BulkCopyArticles.RequestBody,
        ]) => bulkCopyArticles(client, pathParams, body),
        onSuccess: async (data) => {
            await callbacks?.onSuccess?.(data)
        },
        onError: async (error) => {
            await callbacks?.onError?.(error)
        },
        onSettled: async () => {
            await queryClient.invalidateQueries({
                queryKey: articleListKey,
            })
            await callbacks?.onSettled?.()
        },
    })
}

export const useBulkUpdateArticleTranslationVisibility = (
    helpCenterId: number,
    callbacks?: AdditionalCallbacks<
        Awaited<ReturnType<typeof bulkUpdateArticleTranslationVisibility>>,
        unknown
    >,
) => {
    const queryClient = useQueryClient()
    const { client: helpCenterClient } = useHelpCenterApi()

    const articleListKey = helpCenterKeys.articles(helpCenterId)

    return useMutation({
        mutationFn: ([client = helpCenterClient, pathParams, body]: [
            client: HelpCenterClient | undefined,
            pathParams: Paths.BulkUpdateArticleTranslationsVisibility.PathParameters,
            body: Paths.BulkUpdateArticleTranslationsVisibility.RequestBody,
        ]) => bulkUpdateArticleTranslationVisibility(client, pathParams, body),
        onSuccess: async (data) => {
            await callbacks?.onSuccess?.(data)
        },
        onError: async (error) => {
            await callbacks?.onError?.(error)
        },
        onSettled: async () => {
            await queryClient.invalidateQueries({
                queryKey: articleListKey,
            })
            await callbacks?.onSettled?.()
        },
    })
}
