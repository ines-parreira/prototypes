import _isNumber from 'lodash/isNumber'
import {chain as _chain} from 'lodash'
import {useState} from 'react'
import {useSelector} from 'react-redux'

import useAppDispatch from '../../../../hooks/useAppDispatch'

import {HelpCenterClient} from '../../../../../../../rest_api/help_center_api/index'
import {
    CreateArticleDto,
    HelpCenterArticle,
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

import {useHelpcenterApi} from './useHelpcenterApi'
import {useHelpCenterIdParam} from './useHelpCenterIdParam'

function updatePositionRequest(
    client: HelpCenterClient,
    articles: HelpCenterArticle[],
    params: {helpCenterId: number; categoryId?: number}
) {
    const sortedArticlesIds = _chain(articles)
        .sortBy(['position'])
        .map((article) => article.id)
        .value()

    if (params.categoryId && params.categoryId >= 0) {
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
    const {client} = useHelpcenterApi()
    const viewLanguage = useSelector(getViewLanguage)
    const [isLoading, setIsLoading] = useState(false)

    return {
        isLoading,

        async createArticle(
            translation: CreateArticleDto['translation'],
            categoryId?: number | null
        ) {
            if (!client) throw new Error('HTTP client not initialized!')

            setIsLoading(true)

            const {data: response} = await client.createArticle(
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

            const article = createArticleFromDto(
                response,
                positions.findIndex((index) => index === response.id)
            )

            dispatch(saveArticles([article]))

            setIsLoading(false)

            return article
        },

        async updateArticle(
            article: HelpCenterArticle,
            categoryId?: number | null
        ) {
            if (!client) throw new Error('HTTP client not initialized!')

            setIsLoading(true)

            await client.updateArticle(
                {
                    id: article.id,
                    help_center_id: helpCenterId,
                },
                {category_id: categoryId}
            )

            const {data: positions} = categoryId
                ? await client.getCategoryArticlesPositions({
                      help_center_id: helpCenterId,
                      category_id: categoryId,
                  })
                : await client.getUncategorizedArticlesPositions({
                      help_center_id: helpCenterId,
                  })

            const updatedArticle: HelpCenterArticle = {
                ...article,
                category_id: categoryId,
                position: positions.findIndex((index) => index === article.id),
            }

            const localeIsAvailable =
                article?.available_locales?.includes(
                    article?.translation?.locale
                ) || false

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
        },

        async updateArticleTranslation(article: HelpCenterArticle) {
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
                }
            )

            return translation
        },

        async createArticleTranslation(article: HelpCenterArticle) {
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
                }
            )

            return translation
        },

        async deleteArticle(articleId: number) {
            if (!client) throw new Error('HTTP client not initialized!')

            setIsLoading(true)

            const response = await client.deleteArticle({
                help_center_id: helpCenterId,
                id: articleId,
            })

            dispatch(deleteArticle(articleId))

            setIsLoading(false)

            return response
        },

        async updateArticlesPositions(
            articles: HelpCenterArticle[],
            categoryId?: number
        ) {
            if (!client) throw new Error('HTTP client not initialized!')

            setIsLoading(true)

            const response = await updatePositionRequest(client, articles, {
                helpCenterId,
                categoryId,
            })

            dispatch(updateArticlesOrder(response))

            setIsLoading(false)
        },

        async deleteArticleTranslation(articleId: number, locale: LocaleCode) {
            if (!client) throw new Error('HTTP client not initialized!')

            setIsLoading(true)

            await client.deleteArticleTranslation({
                help_center_id: helpCenterId,
                article_id: articleId,
                locale,
            })

            dispatch(removeLocaleFromArticle({articleId, locale}))

            if (locale === viewLanguage) {
                dispatch(deleteArticle(articleId))
            }

            setIsLoading(false)
        },

        async cloneArticle(article: HelpCenterArticle) {
            if (!client) throw new Error('HTTP client not initialized!')

            const payload: CreateArticleDto['translation'] = {
                locale: article.translation.locale,
                excerpt: article.translation.excerpt,
                content: article.translation.content || '',
                slug: `${article.translation.slug}-copy`,
                title: `${article.translation.title} copy`,
            }

            setIsLoading(true)

            const translations = await client
                .listArticleTranslations({
                    help_center_id: helpCenterId,
                    article_id: article.id,
                })
                .then((response) => response.data.data)

            const duplicateArticle = _isNumber(article.category_id)
                ? await this.createArticle(payload, article.category_id)
                : await this.createArticle(payload)

            await Promise.all(
                translations
                    .filter(
                        (translation) =>
                            translation.locale !== article.translation.locale
                    )
                    .map((translation) =>
                        client.createArticleTranslation(
                            {
                                help_center_id: helpCenterId,
                                article_id: duplicateArticle.id,
                            },
                            {
                                locale: translation.locale,
                                title: `${translation.title} copy`,
                                excerpt: translation.excerpt,
                                content: translation.content,
                                slug: `${translation.slug}-copy`,
                            }
                        )
                    )
            )

            dispatch(
                pushArticleSupportedLocales({
                    articleId: duplicateArticle.id,
                    supportedLocales: translations.map(
                        (translation) => translation.locale
                    ),
                })
            )

            setIsLoading(false)

            return duplicateArticle
        },
    }
}
