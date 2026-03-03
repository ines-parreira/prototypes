import { useCallback, useMemo, useState } from 'react'

import { useQueryClient } from '@tanstack/react-query'
import { chain as _chain } from 'lodash'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { helpCenterKeys } from 'models/helpCenter/queries'
import type {
    Article,
    CreateArticleTranslationDto,
    LocaleCode,
} from 'models/helpCenter/types'
import { createArticleFromDto } from 'models/helpCenter/utils'
import type { HelpCenterClient } from 'rest_api/help_center_api/client'
import {
    deleteArticle as deleteArticleAction,
    getArticlesById,
    pushArticleSupportedLocales,
    removeLocaleFromArticle,
    saveArticles,
    updateArticle as updateArticleAction,
    updateArticlesOrder,
} from 'state/entities/helpCenter/articles'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import { getViewLanguage } from 'state/ui/helpCenter'

import { ARTICLES_PER_PAGE, HELP_CENTER_DEFAULT_LOCALE } from '../constants'
import type { ArticleTemplateKey } from '../types/articleTemplates'
import { useCategoriesActions } from './useCategoriesActions'
import useCurrentHelpCenter from './useCurrentHelpCenter'
import { useHelpCenterApi } from './useHelpCenterApi'

function updatePositionRequest(
    client: HelpCenterClient,
    articles: Article[],
    params: { helpCenterId: number; categoryId: number | null },
) {
    const sortedArticlesIds = _chain(articles)
        .sortBy(['position'])
        .map((article) => article.id)
        .value()

    if (typeof params.categoryId === 'number') {
        return client
            .setArticlesPositionsInCategory(
                {
                    help_center_id: params.helpCenterId,
                    category_id: params.categoryId,
                },
                sortedArticlesIds,
            )
            .then((response) => response.data)
    }

    return client
        .setUncategorizedArticlesPositions(
            {
                help_center_id: params.helpCenterId,
            },
            sortedArticlesIds,
        )
        .then((response) => response.data)
}

export const useArticlesActions = () => {
    const helpCenter = useCurrentHelpCenter()
    const helpCenterId = helpCenter.id
    const dispatch = useAppDispatch()
    const { client } = useHelpCenterApi()
    const viewLanguage =
        useAppSelector(getViewLanguage) ?? HELP_CENTER_DEFAULT_LOCALE
    const { fetchCategoryArticleCount } = useCategoriesActions()
    const articlesById = useAppSelector(getArticlesById)
    const queryClient = useQueryClient()

    /* TODO: Fix isLoading
            isLoading works only in case of sequential requests. If 2 requests started,
            and only 1st finished, isLoading will be false, but should be true
    */
    const [isLoading, setIsLoading] = useState(false)

    const invalidateArticlesQuery = useCallback(() => {
        queryClient.invalidateQueries({
            queryKey: helpCenterKeys.articles(helpCenter.id),
        })
    }, [queryClient, helpCenter.id])

    const invalidateArticleTranslationsQuery = useCallback(
        (selectedArticleId: number) => {
            queryClient.invalidateQueries({
                queryKey: helpCenterKeys.articleTranslations(
                    helpCenter.id,
                    selectedArticleId,
                ),
            })
        },
        [queryClient, helpCenter.id],
    )

    const fetchArticlesByIds = useCallback(
        async (ids: number[]) => {
            if (!client) throw new Error('HTTP client not initialized!')

            setIsLoading(true)

            try {
                const {
                    data: { data: articles, meta },
                } = await client.listArticles({
                    help_center_id: helpCenterId,
                    order_by: 'position',
                    version_status: 'latest_draft',
                    ids,
                    per_page: ids.length,
                    page: 1,
                })

                const payload = articles.map((article, index) =>
                    createArticleFromDto(article, index),
                )

                dispatch(saveArticles(payload))

                setIsLoading(false)

                return { articles, meta }
            } catch (err) {
                setIsLoading(false)

                throw err
            }
        },
        [client, dispatch, helpCenterId],
    )

    const fetchArticles = useCallback(
        async (
            categoryId: number | null,
            params?: { page: number; per_page: number; ids?: number[] },
        ) => {
            if (!client) throw new Error('HTTP client not initialized!')

            setIsLoading(true)

            try {
                const {
                    data: { data: articles, meta },
                } = await (categoryId !== null
                    ? client.listCategoryArticles({
                          help_center_id: helpCenterId,
                          category_id: categoryId,
                          order_by: 'position',
                          version_status: 'latest_draft',
                          ...params,
                      })
                    : client.listArticles({
                          help_center_id: helpCenterId,
                          has_category: false,
                          order_by: 'position',
                          version_status: 'latest_draft',
                          ...params,
                      }))

                const { data: positions } =
                    categoryId !== null
                        ? await client.getCategoryArticlesPositions({
                              help_center_id: helpCenterId,
                              category_id: categoryId,
                          })
                        : await client.getUncategorizedArticlesPositions({
                              help_center_id: helpCenterId,
                          })

                const payload = articles.map((article) =>
                    createArticleFromDto(
                        article,
                        positions.findIndex(
                            (articleId) => articleId === article.id,
                        ),
                    ),
                )

                dispatch(saveArticles(payload))

                setIsLoading(false)

                return { articles, meta, positions }
            } catch (err) {
                setIsLoading(false)

                throw err
            }
        },
        [client, dispatch, helpCenterId],
    )

    const createArticle = useCallback(
        async (
            translation: CreateArticleTranslationDto,
            templateKey: ArticleTemplateKey | null,
        ): Promise<Article> => {
            if (!client) throw new Error('HTTP client not initialized!')

            setIsLoading(true)

            try {
                const { data } = await client.createArticle(
                    {
                        help_center_id: helpCenterId,
                    },
                    {
                        translation,
                        template_key: templateKey ?? undefined,
                    },
                )

                const { data: positions } = translation.category_id
                    ? await client.getCategoryArticlesPositions({
                          help_center_id: helpCenterId,
                          category_id: translation.category_id,
                      })
                    : await client.getUncategorizedArticlesPositions({
                          help_center_id: helpCenterId,
                      })

                const createdArticle = createArticleFromDto(
                    data,
                    positions.findIndex((articleId) => articleId === data.id),
                )

                dispatch(saveArticles([createdArticle]))

                invalidateArticlesQuery()

                void fetchCategoryArticleCount(data.category_id, viewLanguage)

                setIsLoading(false)

                return createdArticle
            } catch (err) {
                setIsLoading(false)

                throw err
            }
        },
        [
            client,
            dispatch,
            fetchCategoryArticleCount,
            helpCenterId,
            viewLanguage,
            invalidateArticlesQuery,
        ],
    )

    const createArticleTranslation = useCallback(
        async (article: Article) => {
            if (!client) throw new Error('HTTP client not initialized!')

            const { data: translation } = await client.createArticleTranslation(
                {
                    help_center_id: helpCenterId,
                    article_id: article.id,
                },
                {
                    locale: article.translation.locale,
                    title: article.translation.title,
                    content: article.translation.content,
                    excerpt: article.translation.excerpt,
                    slug: article.translation.slug,
                    seo_meta: article.translation.seo_meta,
                    is_current: article.translation.is_current,
                    visibility_status: article.translation.visibility_status,
                    customer_visibility:
                        article.translation.customer_visibility,
                    category_id: article.translation.category_id,
                },
            )

            return translation
        },
        [client, helpCenterId],
    )

    const updateArticleTranslation = useCallback(
        async (article: Article) => {
            if (!client) throw new Error('HTTP client not initialized!')

            const { data: translation } = await client.updateArticleTranslation(
                {
                    help_center_id: helpCenterId,
                    article_id: article.id,
                    locale: article.translation.locale,
                },
                {
                    title: article.translation.title,
                    content: article.translation.content,
                    excerpt: article.translation.excerpt,
                    slug: article.translation.slug,
                    seo_meta: article.translation.seo_meta,
                    is_current: article.translation.is_current,
                    category_id: article.translation.category_id,
                    visibility_status: article.translation.visibility_status,
                    customer_visibility:
                        article.translation.customer_visibility,
                },
            )

            return translation
        },
        [client, helpCenterId],
    )

    const updateArticle = useCallback(
        async (
            defaultLocale: LocaleCode,
            article: Article,
        ): Promise<Article> => {
            if (!client) throw new Error('HTTP client not initialized!')

            setIsLoading(true)

            try {
                const previousCategoryId = article.category_id
                const maybeNextCategoryId = article.translation.category_id

                const { data: positions } = maybeNextCategoryId
                    ? await client.getCategoryArticlesPositions({
                          help_center_id: helpCenterId,
                          category_id: maybeNextCategoryId,
                      })
                    : await client.getUncategorizedArticlesPositions({
                          help_center_id: helpCenterId,
                      })

                const updatedArticle: Article = {
                    ...article,
                    translation: article.translation,
                    position: positions.findIndex(
                        (articleId) => articleId === article.id,
                    ),
                }

                const localeIsAvailable =
                    updatedArticle.available_locales.includes(
                        article.translation.locale,
                    )

                updatedArticle.translation = {
                    ...(localeIsAvailable
                        ? await updateArticleTranslation(updatedArticle)
                        : await createArticleTranslation(updatedArticle)),
                    rating: article.translation.rating,
                }

                // if a new translation was added, the updated article must contain it in its available_locales
                updatedArticle.available_locales = Array.from(
                    new Set(updatedArticle.available_locales).add(
                        updatedArticle.translation.locale,
                    ),
                )

                if (updatedArticle.translation.locale !== viewLanguage) {
                    const {
                        data: { data: translations },
                    } = await client.listArticleTranslations({
                        help_center_id: helpCenterId,
                        article_id: article.id,
                        version_status: 'latest_draft',
                    })

                    updatedArticle.translation =
                        translations.find((t) => t.locale === viewLanguage) ||
                        updatedArticle.translation
                }

                if (article.translation.locale === defaultLocale) {
                    dispatch(updateArticleAction(updatedArticle))
                }

                invalidateArticlesQuery()

                // update the article count for the old category
                void fetchCategoryArticleCount(previousCategoryId, viewLanguage)

                if (previousCategoryId !== maybeNextCategoryId) {
                    // update the article count for the new category
                    void fetchCategoryArticleCount(
                        maybeNextCategoryId,
                        viewLanguage,
                    )

                    // fetch the articles for the new category
                    void fetchArticles(updatedArticle.translation.category_id, {
                        page: 1,
                        per_page: ARTICLES_PER_PAGE,
                    })
                }

                dispatch(
                    pushArticleSupportedLocales({
                        articleId: article.id,
                        supportedLocales: [article.translation.locale],
                    }),
                )

                setIsLoading(false)

                return updatedArticle
            } catch (err) {
                setIsLoading(false)

                throw err
            }
        },
        [
            client,
            createArticleTranslation,
            dispatch,
            fetchArticles,
            fetchCategoryArticleCount,
            helpCenterId,
            updateArticleTranslation,
            viewLanguage,
            invalidateArticlesQuery,
        ],
    )

    const deleteArticle = useCallback(
        async (articleId: number) => {
            if (!client) throw new Error('HTTP client not initialized!')

            setIsLoading(true)

            try {
                const response = await client.deleteArticle({
                    help_center_id: helpCenterId,
                    id: articleId,
                })

                dispatch(deleteArticleAction(articleId))

                const articleToBeDeleted = articlesById[articleId.toString()]
                if (articleToBeDeleted) {
                    void fetchCategoryArticleCount(
                        articleToBeDeleted.category_id,
                        viewLanguage,
                    )
                }

                invalidateArticlesQuery()

                setIsLoading(false)

                return response
            } catch (err) {
                setIsLoading(false)

                throw err
            }
        },
        [
            articlesById,
            client,
            dispatch,
            fetchCategoryArticleCount,
            helpCenterId,
            viewLanguage,
            invalidateArticlesQuery,
        ],
    )

    const updateArticlesPositions = useCallback(
        async (articles: Article[], categoryId: number | null) => {
            if (!client) throw new Error('HTTP client not initialized!')

            setIsLoading(true)

            try {
                const response = await updatePositionRequest(client, articles, {
                    helpCenterId,
                    categoryId,
                })

                dispatch(updateArticlesOrder(response))

                setIsLoading(false)
                void dispatch(
                    notify({
                        message: 'Articles reordered with success',
                        status: NotificationStatus.Success,
                    }),
                )
            } catch (err) {
                setIsLoading(false)
                void dispatch(
                    notify({
                        message: 'Failed to reorder articles',
                        status: NotificationStatus.Error,
                    }),
                )
                throw err
            }
        },
        [client, dispatch, helpCenterId],
    )

    const deleteArticleTranslation = useCallback(
        async (articleId: number, locale: LocaleCode) => {
            if (!client) throw new Error('HTTP client not initialized!')

            setIsLoading(true)

            try {
                await client.deleteArticleTranslation({
                    help_center_id: helpCenterId,
                    article_id: articleId,
                    locale,
                })

                dispatch(removeLocaleFromArticle({ articleId, locale }))
                invalidateArticlesQuery()
                invalidateArticleTranslationsQuery(articleId)

                setIsLoading(false)
            } catch (err) {
                setIsLoading(false)

                throw err
            }
        },
        [
            client,
            dispatch,
            helpCenterId,
            invalidateArticleTranslationsQuery,
            invalidateArticlesQuery,
        ],
    )

    const cloneArticle = useCallback(
        async (article: Article) => {
            if (!client) throw new Error('HTTP client not initialized!')

            const translation: CreateArticleTranslationDto = {
                locale: article.translation.locale,
                title: `${article.translation.title} copy`,
                excerpt: article.translation.excerpt,
                content: article.translation.content || '',
                slug: `${article.translation.slug}-copy`,
                category_id: article.translation.category_id,
                visibility_status: article.translation.visibility_status,
                customer_visibility: article.translation.customer_visibility,
                seo_meta: {
                    title: null,
                    description: null,
                },
            }

            try {
                setIsLoading(true)

                const translations = await client
                    .listArticleTranslations({
                        help_center_id: helpCenterId,
                        article_id: article.id,
                        version_status: 'latest_draft',
                    })
                    .then((response) => response.data.data)

                const clonedArticle = await createArticle(translation, null)

                await Promise.all(
                    translations
                        .filter((t) => t.locale !== article.translation.locale)
                        .map((t) =>
                            client.createArticleTranslation(
                                {
                                    help_center_id: helpCenterId,
                                    article_id: clonedArticle.id,
                                },
                                {
                                    locale: t.locale,
                                    title: `${t.title} copy`,
                                    excerpt: t.excerpt,
                                    content: t.content,
                                    slug: `${t.slug}-copy`,
                                    seo_meta: {
                                        title: null,
                                        description: null,
                                    },
                                    category_id: t.category_id,
                                    visibility_status: t.visibility_status,
                                    customer_visibility: t.customer_visibility,
                                },
                            ),
                        ),
                )

                dispatch(
                    pushArticleSupportedLocales({
                        articleId: clonedArticle.id,
                        supportedLocales: translations.map(
                            (translation) => translation.locale,
                        ),
                    }),
                )

                setIsLoading(false)

                return clonedArticle
            } catch (err) {
                setIsLoading(false)

                throw err
            }
        },
        [client, createArticle, dispatch, helpCenterId],
    )

    return useMemo(
        () => ({
            isLoading,
            fetchArticlesByIds,
            fetchArticles,
            createArticle,
            updateArticle,
            updateArticleTranslation,
            createArticleTranslation,
            deleteArticle,
            updateArticlesPositions,
            deleteArticleTranslation,
            cloneArticle,
        }),
        [
            cloneArticle,
            createArticle,
            createArticleTranslation,
            deleteArticle,
            deleteArticleTranslation,
            fetchArticles,
            fetchArticlesByIds,
            isLoading,
            updateArticle,
            updateArticleTranslation,
            updateArticlesPositions,
        ],
    )
}
