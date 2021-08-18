import {createSelector} from 'reselect'

import {readHelpCenterStore} from '../selectors'

import {readViewLanguage} from '../ui/selectors'

const helpCenterArticlesStore = createSelector(
    readHelpCenterStore,
    (store) => store.articles
)

const readArticlesById = createSelector(
    helpCenterArticlesStore,
    (store) => store.articlesById
)

export const readArticles = createSelector(
    readArticlesById,
    readViewLanguage,
    (articles, locale) =>
        Object.values(articles).filter(
            (article) => article.translation?.locale === locale
        ) || []
)

export const readArticleById = (articleId: number) =>
    createSelector(readArticlesById, (articles) => articles[articleId])

export const readArticlesInCategory = (categoryId: number) =>
    createSelector(readArticles, (articles) =>
        articles.filter(
            (article) =>
                article.category_id && article.category_id === categoryId
        )
    )

export const readUncategorizedArticles = createSelector(
    readArticles,
    (articles) => articles.filter((article) => article.category_id === null)
)
