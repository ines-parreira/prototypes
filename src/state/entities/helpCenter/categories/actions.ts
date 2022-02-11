import {createAction} from '@reduxjs/toolkit'

import {
    Category,
    CategoryTranslation,
    LocaleCode,
} from 'models/helpCenter/types'

import {CategoryActions} from './types'

export const saveCategories = createAction<Category[]>(
    CategoryActions.SAVE_CATEGORIES
)

export const updateCategory = createAction<Category>(
    CategoryActions.UPDATE_CATEGORY
)

export const deleteCategory = createAction<number>(
    CategoryActions.DELETE_CATEGORY
)

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
