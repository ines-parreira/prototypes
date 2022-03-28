import {createSelector} from 'reselect'

import {Category, NonRootCategory} from 'models/helpCenter/types'

import {getArticles} from '../articles/selectors'
import {getHelpCenterStore} from '../selectors'
import {isNonRootCategory} from '.'

export const helpCenterCategoriesStore = createSelector(
    getHelpCenterStore,
    (store) => store.categories
)

export const getCategoriesById = createSelector(
    helpCenterCategoriesStore,
    (store) => {
        const {categoriesById} = store

        return categoriesById
    }
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
                traverseCategories(categoriesById[categoryId])
            )
        }

        traverseCategories(rootCategory)

        return categoriesArray
    }
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
    }
)

export const getParentCategories = createSelector(
    getCategoriesById,
    (categories) => {
        const rootCategory = categories['0']
        const categoriesArray: Category[] = []
        const traverseCategories = (category: Category, level: number) => {
            if (!category) {
                return
            }
            categoriesArray.push(category)
            category.children.forEach((categoryId) => {
                if (level < 3) {
                    traverseCategories(categories[categoryId], level + 1)
                }
            })
        }

        traverseCategories(rootCategory, 0)

        return categoriesArray
    }
)

export const getCategoryById = (id: number | undefined) =>
    createSelector(getCategoriesById, (categories) =>
        id !== undefined ? categories[id.toString()] : undefined
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
