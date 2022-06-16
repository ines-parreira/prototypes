import {useCallback, useState} from 'react'
import {chain as _chain} from 'lodash'

import {HelpCenterClient} from 'rest_api/help_center_api/index'

import useAppSelector from 'hooks/useAppSelector'
import useAppDispatch from 'hooks/useAppDispatch'
import {
    Article,
    CreateArticleTranslationDto,
    LocaleCode,
} from 'models/helpCenter/types'
import {createArticleFromDto} from 'models/helpCenter/utils'
import {
    deleteArticle,
    pushArticleSupportedLocales,
    removeLocaleFromArticle,
    saveArticles,
    updateArticle,
    updateArticlesOrder,
} from 'state/entities/helpCenter/articles'
import {getViewLanguage} from 'state/ui/helpCenter'

import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'

import {useHelpCenterApi} from './useHelpCenterApi'
import {useHelpCenterIdParam} from './useHelpCenterIdParam'

function updatePositionRequest(
    client: HelpCenterClient,
    articles: Article[],
    params: {helpCenterId: number; categoryId: number | null}
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
                sortedArticlesIds
            )
            .then((response) => response.data)
    }

    return client
        .setUncategorizedArticlesPositions(
            {
                help_center_id: params.helpCenterId,
            },
            sortedArticlesIds
        )
        .then((response) => response.data)
}

export const useArticlesActions = () => {
    const helpCenterId = useHelpCenterIdParam()
    const dispatch = useAppDispatch()
    const {client} = useHelpCenterApi()
    const viewLanguage = useAppSelector(getViewLanguage)
    const [isLoading, setIsLoading] = useState(false)

    return {
        isLoading,

        fetchArticles: async (
            categoryId: number | null,
            params?: {page: number; per_page: number}
        ) => {
            if (!client) throw new Error('HTTP client not initialized!')

            setIsLoading(true)

            try {
                const {
                    data: {data: articles, meta},
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

                const {data: positions} =
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
                            (articleId) => articleId === article.id
                        )
                    )
                )

                dispatch(saveArticles(payload))

                setIsLoading(false)

                return {articles, meta, positions}
            } catch (err) {
                setIsLoading(false)

                throw err
            }
        },

        getArticleCount: useCallback(
            async (categoryId: number | null) => {
                if (!client) throw new Error('HTTP client not initialized!')

                setIsLoading(true)

                try {
                    const {
                        data: {meta},
                    } = await (categoryId !== null
                        ? client.listCategoryArticles({
                              help_center_id: helpCenterId,
                              category_id: categoryId,
                              page: 1,
                              per_page: 1,
                              version_status: 'latest_draft',
                          })
                        : client.listArticles({
                              help_center_id: helpCenterId,
                              has_category: false,
                              page: 1,
                              per_page: 1,
                              version_status: 'latest_draft',
                          }))

                    setIsLoading(false)

                    return meta.item_count
                } catch (err) {
                    setIsLoading(false)

                    throw err
                }
            },
            [client, helpCenterId]
        ),

        async createArticle(
            translation: CreateArticleTranslationDto
        ): Promise<Article> {
            if (!client) throw new Error('HTTP client not initialized!')

            setIsLoading(true)

            try {
                const {data} = await client.createArticle(
                    {
                        help_center_id: helpCenterId,
                    },
                    {translation}
                )

                const {data: positions} = translation.category_id
                    ? await client.getCategoryArticlesPositions({
                          help_center_id: helpCenterId,
                          category_id: translation.category_id,
                      })
                    : await client.getUncategorizedArticlesPositions({
                          help_center_id: helpCenterId,
                      })

                const createdArticle = createArticleFromDto(
                    data,
                    positions.findIndex((articleId) => articleId === data.id)
                )

                dispatch(saveArticles([createdArticle]))

                setIsLoading(false)

                return createdArticle
            } catch (err) {
                setIsLoading(false)

                throw err
            }
        },

        async updateArticle(
            defaultLocale: LocaleCode,
            article: Article
        ): Promise<Article> {
            if (!client) throw new Error('HTTP client not initialized!')

            setIsLoading(true)

            try {
                const {data: positions} = article.translation.category_id
                    ? await client.getCategoryArticlesPositions({
                          help_center_id: helpCenterId,
                          category_id: article.translation.category_id,
                      })
                    : await client.getUncategorizedArticlesPositions({
                          help_center_id: helpCenterId,
                      })

                const updatedArticle: Article = {
                    ...article,
                    translation: article.translation,
                    position: positions.findIndex(
                        (articleId) => articleId === article.id
                    ),
                }

                const localeIsAvailable =
                    updatedArticle.available_locales.includes(
                        article.translation.locale
                    )

                updatedArticle.translation = {
                    ...(localeIsAvailable
                        ? await this.updateArticleTranslation(updatedArticle)
                        : await this.createArticleTranslation(updatedArticle)),
                    rating: article.translation.rating,
                }

                // if a new translation was added, the updated article must contain it in its available_locales
                updatedArticle.available_locales = Array.from(
                    new Set(updatedArticle.available_locales).add(
                        updatedArticle.translation.locale
                    )
                )

                if (updatedArticle.translation.locale !== viewLanguage) {
                    const {
                        data: {data: translations},
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
                    dispatch(updateArticle(updatedArticle))
                }

                dispatch(
                    pushArticleSupportedLocales({
                        articleId: article.id,
                        supportedLocales: [article.translation.locale],
                    })
                )

                setIsLoading(false)

                return updatedArticle
            } catch (err) {
                setIsLoading(false)

                throw err
            }
        },

        async updateArticleTranslation(article: Article) {
            if (!client) throw new Error('HTTP client not initialized!')

            const {data: translation} = await client.updateArticleTranslation(
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
                }
            )

            return translation
        },

        async createArticleTranslation(article: Article) {
            if (!client) throw new Error('HTTP client not initialized!')

            const {data: translation} = await client.createArticleTranslation(
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
                    category_id: article.translation.category_id,
                }
            )

            return translation
        },

        async deleteArticle(articleId: number) {
            if (!client) throw new Error('HTTP client not initialized!')

            setIsLoading(true)

            try {
                const response = await client.deleteArticle({
                    help_center_id: helpCenterId,
                    id: articleId,
                })

                dispatch(deleteArticle(articleId))

                setIsLoading(false)

                return response
            } catch (err) {
                setIsLoading(false)

                throw err
            }
        },

        async updateArticlesPositions(
            articles: Article[],
            categoryId: number | null
        ) {
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
                    })
                )
            } catch (err) {
                setIsLoading(false)
                void dispatch(
                    notify({
                        message: 'Failed to reorder articles',
                        status: NotificationStatus.Error,
                    })
                )
                throw err
            }
        },

        async deleteArticleTranslation(articleId: number, locale: LocaleCode) {
            if (!client) throw new Error('HTTP client not initialized!')

            setIsLoading(true)

            try {
                await client.deleteArticleTranslation({
                    help_center_id: helpCenterId,
                    article_id: articleId,
                    locale,
                })

                dispatch(removeLocaleFromArticle({articleId, locale}))

                setIsLoading(false)
            } catch (err) {
                setIsLoading(false)

                throw err
            }
        },

        async cloneArticle(article: Article) {
            if (!client) throw new Error('HTTP client not initialized!')

            const translation: CreateArticleTranslationDto = {
                locale: article.translation.locale,
                title: `${article.translation.title} copy`,
                excerpt: article.translation.excerpt,
                content: article.translation.content || '',
                slug: `${article.translation.slug}-copy`,
                category_id: article.translation.category_id,
                visibility_status: article.translation.visibility_status,
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

                const clonedArticle = await this.createArticle(translation)

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
                                }
                            )
                        )
                )

                dispatch(
                    pushArticleSupportedLocales({
                        articleId: clonedArticle.id,
                        supportedLocales: translations.map(
                            (translation) => translation.locale
                        ),
                    })
                )

                setIsLoading(false)

                return clonedArticle
            } catch (err) {
                setIsLoading(false)

                throw err
            }
        },
    }
}
