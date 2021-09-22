import {createSelector} from 'reselect'

import {getHelpCenterStore} from '../selectors'
import {getViewLanguage} from '../ui/selectors'

const helpCenterArticlesStore = createSelector(
    getHelpCenterStore,
    (store) => store.articles
)

const getArticlesById = createSelector(
    helpCenterArticlesStore,
    (store) => store.articlesById
)

export const getArticles = createSelector(
    getArticlesById,
    getViewLanguage,
    (articles, locale) =>
        Object.values(articles).filter(
            (article) => article.translation?.locale === locale
        ) || []
)

export const getArticleById = (articleId: number) =>
    createSelector(getArticlesById, (articles) => articles[articleId])

export const getArticlesInCategory = (categoryId: number) =>
    createSelector(getArticles, (articles) =>
        articles.filter(
            (article) =>
                article.category_id && article.category_id === categoryId
        )
    )

export const getUncategorizedArticles = createSelector(
    getArticles,
    (articles) => articles.filter((article) => article.category_id === null)
)
