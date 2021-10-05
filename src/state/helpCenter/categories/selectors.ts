import {createSelector} from 'reselect'

import {getArticles} from '../articles/selectors'
import {getHelpCenterStore} from '../selectors'

export const helpCenterCategoriesStore = createSelector(
    getHelpCenterStore,
    (store) => store.categories
)

const getCategoriesById = createSelector(
    helpCenterCategoriesStore,
    (store) => store.categoriesById
)

export const getCategories = createSelector(getCategoriesById, (categories) =>
    Object.values(categories)
)

export const getCategoryById = (id: number) =>
    createSelector(getCategoriesById, (categories) => categories[id])

export const getCategoriesWithArticles = createSelector(
    getCategories,
    getArticles,
    (categories, articles) =>
        categories.map((category) => {
            // TODO: Find a way to use getArticlesInCategory from articles selectors
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
