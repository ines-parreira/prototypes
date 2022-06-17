import {createSelector} from 'reselect'

import {Article} from 'models/helpCenter/types'
import {getHelpCenterStore} from '../selectors'

const helpCenterArticlesStore = createSelector(
    getHelpCenterStore,
    (store) => store.articles
)

export const getArticlesById = createSelector(
    helpCenterArticlesStore,
    (store) => store.articlesById
)

export const getArticles = createSelector(getArticlesById, (articles) =>
    Object.values(articles)
)

export const getArticleById = (articleId: number) =>
    createSelector(
        getArticlesById,
        (articles) => articles[articleId.toString()]
    )

export const getArticlesInCategory = (categoryId: number) =>
    createSelector(getArticles, (articles: Article[]) =>
        articles.filter(
            (article) =>
                article.translation.category_id &&
                article.translation.category_id === categoryId
        )
    )

export const getUncategorizedArticles = createSelector(
    getArticles,
    (articles: Article[]) =>
        articles.filter((article) => article.translation.category_id === null)
)
