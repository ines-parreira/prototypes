import {createReducer} from '@reduxjs/toolkit'
import _uniq from 'lodash/uniq'

import {HelpCenterCategoriesState} from './types'

import {
    saveCategories,
    updateCategory,
    deleteCategory,
    resetCategories,
    updateCategoryTranslation,
    updateCategoriesOrder,
    pushCategorySupportedLocales,
    removeLocaleFromCategory,
} from './actions'

export const initialState: HelpCenterCategoriesState = {
    categoriesById: {},
}

export default createReducer<HelpCenterCategoriesState>(
    initialState,
    (builder) =>
        builder
            // Append the payload to current state
            .addCase(saveCategories, (state, {payload}) => {
                state.categoriesById = payload.reduce(
                    (acc, category) => ({
                        ...acc,
                        [category.id]: category,
                    }),
                    state.categoriesById
                )
            })

            // Merge payload with the current category
            .addCase(updateCategory, (state, {payload}) => {
                state.categoriesById[payload.id] = payload
            })

            .addCase(updateCategoryTranslation, (state, {payload}) => {
                state.categoriesById[payload.category_id].translation = payload
            })

            //   Delete category by id
            .addCase(deleteCategory, (state, {payload}) => {
                delete state.categoriesById[payload]
            })

            .addCase(updateCategoriesOrder, (state, {payload}) => {
                payload.forEach((categoryId, position) => {
                    state.categoriesById[categoryId].position = position
                })
            })

            .addCase(pushCategorySupportedLocales, (state, {payload}) => {
                if (state.categoriesById[payload.categoryId]) {
                    state.categoriesById[payload.categoryId].available_locales =
                        _uniq([
                            ...state.categoriesById[payload.categoryId]
                                .available_locales,
                            ...payload.supportedLocales,
                        ])
                }
            })

            .addCase(removeLocaleFromCategory, (state, {payload}) => {
                const {categoryId, locale} = payload
                if (state.categoriesById[categoryId]) {
                    const indexOf = state.categoriesById[
                        categoryId
                    ].available_locales.findIndex((lang) => lang === locale)

                    if (indexOf >= 0) {
                        state.categoriesById[
                            categoryId
                        ].available_locales.splice(indexOf, 1)
                    }
                }
            })

            // Restores initial state
            .addCase(resetCategories, () => initialState)
)
