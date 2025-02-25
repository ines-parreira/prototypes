import { createSelector } from 'reselect'

import { Category, NonRootCategory } from 'models/helpCenter/types'
import {
    CATEGORY_TREE_MAX_LEVEL,
    HELP_CENTER_ROOT_CATEGORY_ID,
} from 'pages/settings/helpCenter/constants'

import { getArticles } from '../articles/selectors'
import { getHelpCenterStore } from '../selectors'
import { isNonRootCategory } from './types'

export const helpCenterCategoriesStore = createSelector(
    getHelpCenterStore,
    (store) => store.categories,
)

export const getCategoriesById = createSelector(
    helpCenterCategoriesStore,
    (store) => {
        const { categoriesById } = store

        return categoriesById
    },
)

export const getRootCategory = createSelector(
    getCategoriesById,
    (categoriesById) => categoriesById['0'],
)

export const getCategories = createSelector(
    getCategoriesById,
    (categoriesById) => {
        const rootCategory = categoriesById['0']
        const categoriesArray: Category[] = []
        const traverseCategories = (category: Category) => {
            if (!category) {
                return
            }
            categoriesArray.push(category)
            category.children.forEach((categoryId) =>
                traverseCategories(categoriesById[categoryId]),
            )
        }

        traverseCategories(rootCategory)

        return categoriesArray
    },
)

export const getNonRootCategoriesById = createSelector(
    getCategories,
    (categories) => {
        const categoriesById: Record<string, NonRootCategory> = {}
        categories.forEach((category) => {
            if (isNonRootCategory(category)) {
                categoriesById[category.id] = category
            }
        })
        return categoriesById
    },
)

export const getParentCategories = createSelector(
    getCategoriesById,
    (categories) => {
        const rootCategory = categories[HELP_CENTER_ROOT_CATEGORY_ID.toString()]
        const categoriesArray: Category[] = []
        const traverseCategories = (category: Category, level: number) => {
            if (!category) {
                return
            }
            categoriesArray.push(category)
            category.children.forEach((categoryId) => {
                if (level < CATEGORY_TREE_MAX_LEVEL) {
                    traverseCategories(categories[categoryId], level + 1)
                }
            })
        }

        traverseCategories(rootCategory, 0)

        return categoriesArray
    },
)

export const getCategoryById = (id: number | undefined) =>
    createSelector(getCategoriesById, (categories) =>
        id !== undefined ? categories[id.toString()] : undefined,
    )

export const getCategoriesWithArticles = createSelector(
    getCategories,
    getArticles,
    (categories, articles) =>
        categories.map((category) => {
            // TODO: Find a way to use getArticlesInCategory from articles selectors
            const articlesInCategory = articles.filter(
                (article) =>
                    article.translation.category_id &&
                    article.translation.category_id === category.id,
            )

            return {
                ...category,
                articles: articlesInCategory,
            }
        }),
)

export const hasNestedCategories = createSelector(
    getCategoriesById,
    (categoriesById) => {
        const topLevelCategories = categoriesById['0']?.children
        if (topLevelCategories) {
            for (const categoryId of topLevelCategories) {
                const subCategories = categoriesById[categoryId]?.children
                if (subCategories && subCategories.length > 0) {
                    return true
                }
            }
        }
        return false
    },
)
