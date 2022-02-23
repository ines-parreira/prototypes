import {createSelector} from 'reselect'
import {Category} from 'models/helpCenter/types'

import {getArticles} from '../articles/selectors'
import {getHelpCenterStore} from '../selectors'

export const helpCenterCategoriesStore = createSelector(
    getHelpCenterStore,
    (store) => store.categories
)

const getCategoriesById = createSelector(helpCenterCategoriesStore, (store) => {
    const {positions = [], categoriesById} = store
    const categoriesWithPosition: Record<string, Category> = {}

    positions.forEach((categoryId, currentIndex) => {
        if (categoriesById[categoryId]) {
            categoriesWithPosition[categoryId] = {
                ...categoriesById[categoryId],
                articles: [],
                position: currentIndex + 1,
            }
        }
    })
    return categoriesWithPosition
})

export const getCategories = createSelector(getCategoriesById, (categories) =>
    Object.values(categories).sort((a, b) => a.position - b.position)
)

export const getCategoryById = (id: number | undefined) =>
    createSelector(getCategoriesById, (categories) =>
        id ? categories[id.toString()] : undefined
    )

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
