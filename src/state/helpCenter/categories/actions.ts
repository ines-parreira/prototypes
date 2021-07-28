import {createAction} from '@reduxjs/toolkit'

import {Category, CategoryTranslation} from '../../../models/helpCenter/types'

import {CategoryActions} from './types'

export const saveCategories = createAction<Category[]>(
    CategoryActions.SAVE_CATEGORIES
)

export const updateCategory = createAction<Category>(
    CategoryActions.UPDATE_CATEGORY
)

export const deleteCategory = createAction<Category>(
    CategoryActions.DELETE_CATEGORY
)

export const updateCategoryTranslation = createAction<CategoryTranslation>(
    CategoryActions.UPDATE_CATEGORY_TRANSLATION
)

export const updateCategoriesOrder = createAction<number[]>(
    CategoryActions.UPDATE_CATEGORIES_ORDER
)

export const resetCategories = createAction(CategoryActions.RESET_CATEGORIES)
