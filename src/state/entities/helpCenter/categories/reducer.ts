import {createReducer} from '@reduxjs/toolkit'
import _uniq from 'lodash/uniq'

import {HelpCenterCategoriesState} from './types'

import {
    saveCategories,
    updateCategory,
    deleteCategory,
    resetCategories,
    savePositions,
    updateCategoryTranslation,
    updateCategoriesOrder,
    pushCategorySupportedLocales,
    removeLocaleFromCategory,
} from './actions'

export const initialState: HelpCenterCategoriesState = {
    categoriesById: {},
    positions: [],
}

export default createReducer<HelpCenterCategoriesState>(
    initialState,
    (builder) =>
        builder
            // Append the payload to current state
            .addCase(saveCategories, (state, {payload}) => {
                const {categories, shouldReset} = payload
                state.categoriesById = categories.reduce(
                    (acc, category) => ({
                        ...acc,
                        [category.id.toString()]: category,
                    }),
                    shouldReset ? {} : state.categoriesById
                )
            })
            // Set the categories positions in current state
            .addCase(savePositions, (state, {payload}) => {
                state.positions = payload
            })

            // Merge payload with the current category
            .addCase(updateCategory, (state, {payload}) => {
                state.categoriesById[payload.id.toString()] = payload
            })

            .addCase(updateCategoryTranslation, (state, {payload}) => {
                state.categoriesById[
                    payload.category_id.toString()
                ].translation = payload
            })

            //   Delete category by id
            .addCase(deleteCategory, (state, {payload}) => {
                delete state.categoriesById[payload.toString()]
            })

            .addCase(updateCategoriesOrder, (state, {payload}) => {
                state.positions = payload
            })

            .addCase(pushCategorySupportedLocales, (state, {payload}) => {
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

            .addCase(removeLocaleFromCategory, (state, {payload}) => {
                const {categoryId, locale} = payload
                if (state.categoriesById[categoryId.toString()]) {
                    const indexOf = state.categoriesById[
                        categoryId.toString()
                    ].available_locales.findIndex((lang) => lang === locale)

                    if (indexOf >= 0) {
                        state.categoriesById[
                            categoryId.toString()
                        ].available_locales.splice(indexOf, 1)
                    }
                }
            })

            // Restores initial state
            .addCase(resetCategories, () => initialState)
)
