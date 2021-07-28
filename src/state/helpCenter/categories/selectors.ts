import {createSelector} from 'reselect'

import {readHelpCenterStore} from '../selectors'

import {readArticles} from '../articles/selectors'

export const helpCenterCategoriesStore = createSelector(
    readHelpCenterStore,
    (store) => store.categories
)

const readCategoriesById = createSelector(
    helpCenterCategoriesStore,
    (store) => store.categoriesById
)

export const readCategories = createSelector(
    readCategoriesById,
    (articles) => Object.values(articles) || []
)

export const readCategoriesWithArticles = createSelector(
    readCategories,
    readArticles,
    (categories, articles) =>
        categories.map((category) => {
            // TODO: Find a way to use readArticlesInCategory from articles selectors
            const articlesInCategory = articles.filter(
                (article) =>
                    article.category_id && article.category_id === category.id
            )

            return {
                ...category,
                articles: articlesInCategory,
            }
        })
)
