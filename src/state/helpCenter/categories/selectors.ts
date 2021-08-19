import {createSelector} from 'reselect'

import {readHelpCenterStore} from '../selectors'

import {readArticles} from '../articles/selectors'
import {readViewLanguage} from '../ui/selectors'

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
    readViewLanguage,
    (categories, locale) =>
        Object.values(categories).filter(
            (category) => category.translation?.locale === locale
        ) || []
)

export const readCategory = (id: number) =>
    createSelector(readCategoriesById, (categories) => categories[id])

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
