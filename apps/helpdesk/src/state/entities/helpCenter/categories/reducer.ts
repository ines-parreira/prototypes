import { createReducer } from '@reduxjs/toolkit'
import { reportError } from '@repo/logging'
import _uniq from 'lodash/uniq'

import { HELP_CENTER_ROOT_CATEGORY_ID } from 'pages/settings/helpCenter/constants'
import { getInitialRootCategory } from 'pages/settings/helpCenter/fixtures/getCategoriesTree.fixtures'

import {
    deleteCategory,
    pushCategorySupportedLocales,
    removeLocaleFromCategory,
    resetCategories,
    saveCategories,
    savePositions,
    updateCategoriesArticleCount,
    updateCategory,
    updateCategoryTranslation,
} from './actions'
import type { HelpCenterCategoriesState } from './types'

export const initialState: HelpCenterCategoriesState = {
    categoriesById: {
        '0': getInitialRootCategory,
    },
}

export default createReducer<HelpCenterCategoriesState>(
    initialState,
    (builder) =>
        builder
            // Append the payload to current state
            .addCase(saveCategories, (state, { payload }) => {
                const { categories, shouldReset } = payload
                state.categoriesById = categories.reduce(
                    (acc, category) => ({
                        ...acc,
                        [category.id.toString()]: {
                            ...category,
                            // If the category is already in the state, keep the article count and don't override it
                            // This is useful when we save the categories after opening an article that uses a category selector
                            articleCount:
                                state.categoriesById[category.id.toString()]
                                    ?.articleCount || 0,
                        },
                    }),
                    shouldReset ? {} : state.categoriesById,
                )
            })
            // Set the categories positions in current state
            .addCase(savePositions, (state, { payload }) => {
                const { categoryId, children } = payload
                if (categoryId) {
                    state.categoriesById[categoryId.toString()].children =
                        children
                } else {
                    state.categoriesById['0'].children = children
                }
            })

            // Merge payload with the current category
            .addCase(updateCategory, (state, { payload }) => {
                state.categoriesById[payload.id.toString()] = payload
            })

            .addCase(updateCategoryTranslation, (state, { payload }) => {
                state.categoriesById[
                    payload.category_id.toString()
                ].translation = payload
            })

            .addCase(updateCategoriesArticleCount, (state, { payload }) => {
                payload.forEach(({ articleCount, categoryId }) => {
                    const category = categoryId
                        ? state.categoriesById[categoryId.toString()]
                        : state.categoriesById[HELP_CENTER_ROOT_CATEGORY_ID]

                    if (category) {
                        category.articleCount = articleCount
                    } else {
                        // This should never happen
                        reportError(
                            new Error(
                                `No categories with id: ${
                                    categoryId ?? 'unknown'
                                } found in state during updateCategoriesArticleCount`,
                            ),
                        )
                    }
                })
            })

            //   Delete category by id
            .addCase(deleteCategory, (state, { payload }) => {
                const parentId =
                    state.categoriesById[payload.toString()].translation
                        ?.parent_category_id ?? 0
                const { children } = state.categoriesById[parentId.toString()]

                //Remove the child from the parent's list
                state.categoriesById[parentId.toString()].children =
                    children.filter((childId) => childId !== payload)

                //Remove the category
                delete state.categoriesById[payload.toString()]
            })

            .addCase(pushCategorySupportedLocales, (state, { payload }) => {
                if (state.categoriesById[payload.categoryId.toString()]) {
                    state.categoriesById[
                        payload.categoryId.toString()
                    ].available_locales = _uniq([
                        ...state.categoriesById[payload.categoryId.toString()]
                            .available_locales,
                        ...payload.supportedLocales,
                    ])
                }
            })

            .addCase(removeLocaleFromCategory, (state, { payload }) => {
                const { categoryId, locale } = payload
                if (state.categoriesById[categoryId.toString()]) {
                    const category = state.categoriesById[categoryId.toString()]

                    category.available_locales =
                        category.available_locales.filter(
                            (availableLocale) => availableLocale !== locale,
                        )
                }
            })

            // Restores initial state
            .addCase(resetCategories, () => initialState),
)
