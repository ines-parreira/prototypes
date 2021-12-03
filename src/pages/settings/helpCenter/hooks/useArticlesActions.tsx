import {useState} from 'react'
import {chain as _chain} from 'lodash'
import _isNumber from 'lodash/isNumber'
import {useSelector} from 'react-redux'

import {HelpCenterClient} from '../../../../../../../rest_api/help_center_api/index'
import useAppDispatch from '../../../../hooks/useAppDispatch'
import {
    Article,
    CreateArticleTranslationDto,
    LocaleCode,
} from '../../../../models/helpCenter/types'
import {createArticleFromDto} from '../../../../models/helpCenter/utils'
import {
    deleteArticle,
    pushArticleSupportedLocales,
    removeLocaleFromArticle,
    saveArticles,
    updateArticle,
    updateArticlesOrder,
} from '../../../../state/helpCenter/articles'
import {getViewLanguage} from '../../../../state/helpCenter/ui'

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
    const viewLanguage = useSelector(getViewLanguage)
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
                          ...params,
                      })
                    : client.listArticles({
                          help_center_id: helpCenterId,
                          has_category: false,
                          order_by: 'position',
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

        getArticleCount: async (categoryId: number | null) => {
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
                      })
                    : client.listArticles({
                          help_center_id: helpCenterId,
                          has_category: false,
                          page: 1,
                          per_page: 1,
                      }))

                setIsLoading(false)

                return meta.item_count
            } catch (err) {
                setIsLoading(false)

                throw err
            }
        },

        async createArticle(
            translation: CreateArticleTranslationDto,
            categoryId: number | null
        ) {
            if (!client) throw new Error('HTTP client not initialized!')

            setIsLoading(true)

            try {
                const {data} = await client.createArticle(
                    {
                        help_center_id: helpCenterId,
                    },
                    {category_id: categoryId, translation}
                )

                const {data: positions} = categoryId
                    ? await client.getCategoryArticlesPositions({
                          help_center_id: helpCenterId,
                          category_id: categoryId,
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

        async updateArticle(article: Article, categoryId: number | null) {
            if (!client) throw new Error('HTTP client not initialized!')

            setIsLoading(true)

            try {
                if (article.category_id !== categoryId) {
                    await client.updateArticle(
                        {
                            id: article.id,
                            help_center_id: helpCenterId,
                        },
                        {category_id: categoryId}
                    )
                }

                const {data: positions} = categoryId
                    ? await client.getCategoryArticlesPositions({
                          help_center_id: helpCenterId,
                          category_id: categoryId,
                      })
                    : await client.getUncategorizedArticlesPositions({
                          help_center_id: helpCenterId,
                      })

                const updatedArticle: Article = {
                    ...article,
                    category_id: categoryId,
                    translation: article.translation,
                    position: positions.findIndex(
                        (articleId) => articleId === article.id
                    ),
                }

                const localeIsAvailable =
                    updatedArticle.available_locales.includes(
                        article.translation.locale
                    )

                updatedArticle.translation = localeIsAvailable
                    ? await this.updateArticleTranslation(updatedArticle)
                    : await this.createArticleTranslation(updatedArticle)

                if (updatedArticle.translation.locale !== viewLanguage) {
                    const {
                        data: {data: translations},
                    } = await client.listArticleTranslations({
                        help_center_id: helpCenterId,
                        article_id: article.id,
                    })

                    updatedArticle.translation =
                        translations.find((t) => t.locale === viewLanguage) ||
                        updatedArticle.translation
                }

                dispatch(updateArticle(updatedArticle))
                dispatch(
                    pushArticleSupportedLocales({
                        articleId: article.id,
                        supportedLocales: [article.translation.locale],
                    })
                )

                setIsLoading(false)
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
            } catch (err) {
                setIsLoading(false)

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
                    })
                    .then((response) => response.data.data)

                const clonedArticle = _isNumber(article.category_id)
                    ? await this.createArticle(translation, article.category_id)
                    : await this.createArticle(translation, null)

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
