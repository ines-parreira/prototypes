import {createSelector} from 'reselect'

import {Article} from '../../../models/helpCenter/types'
import {getHelpCenterStore} from '../selectors'

const helpCenterArticlesStore = createSelector(
    getHelpCenterStore,
    (store) => store.articles
)

const getArticlesById = createSelector(
    helpCenterArticlesStore,
    (store) => store.articlesById
)

export const getArticles = createSelector(getArticlesById, (articles) =>
    Object.values(articles)
)

export const getArticleById = (articleId: number) =>
    createSelector(getArticlesById, (articles) => articles[articleId])

export const getArticlesInCategory = (categoryId: number) =>
    createSelector(getArticles, (articles: Article[]) =>
        articles.filter(
            (article) =>
                article.category_id && article.category_id === categoryId
        )
    )

export const getUncategorizedArticles = createSelector(
    getArticles,
    (articles: Article[]) =>
        articles.filter((article) => article.category_id === null)
)
