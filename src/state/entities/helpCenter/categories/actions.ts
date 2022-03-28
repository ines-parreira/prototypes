import {createAction} from '@reduxjs/toolkit'

import {
    CategoryTranslation,
    Category,
    LocaleCode,
} from 'models/helpCenter/types'

import {CategoryActions} from './types'

export const saveCategories = createAction<{
    categories: Category[]
    shouldReset: boolean
}>(CategoryActions.SAVE_CATEGORIES)

export const updateCategory = createAction<Category>(
    CategoryActions.UPDATE_CATEGORY
)

export const deleteCategory = createAction<number>(
    CategoryActions.DELETE_CATEGORY
)

export const savePositions = createAction<{
    children: number[]
    categoryId?: number | null
}>(CategoryActions.SAVE_POSITIONS)

export const pushCategorySupportedLocales = createAction<{
    categoryId: number
    supportedLocales: LocaleCode[]
}>(CategoryActions.PUSH_CATEGORY_LOCALES)

export const removeLocaleFromCategory = createAction<{
    categoryId: number
    locale: LocaleCode
}>(CategoryActions.REMOVE_CATEGORY_LOCALE)

export const updateCategoryTranslation = createAction<CategoryTranslation>(
    CategoryActions.UPDATE_CATEGORY_TRANSLATION
)

export const updateCategoriesOrder = createAction<number[]>(
    CategoryActions.UPDATE_CATEGORIES_ORDER
)

export const resetCategories = createAction(CategoryActions.RESET_CATEGORIES)
