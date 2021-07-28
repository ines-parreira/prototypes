import {createReducer} from '@reduxjs/toolkit'

import {HelpCenterCategoriesState} from './types'

import {
    saveCategories,
    updateCategory,
    deleteCategory,
    resetCategories,
    updateCategoryTranslation,
    updateCategoriesOrder,
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
                delete state.categoriesById[payload.id]
            })

            .addCase(updateCategoriesOrder, (state, {payload}) => {
                payload.forEach((categoryId, position) => {
                    state.categoriesById[categoryId].position = position
                })
            })

            // Restores initial state
            .addCase(resetCategories, () => initialState)
)
