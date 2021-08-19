import {PayloadActionCreator} from '@reduxjs/toolkit'

import {
    Category,
    CategoryTranslation,
    LocaleCode,
} from '../../../models/helpCenter/types'

export enum CategoryActions {
    SAVE_CATEGORIES = 'HELPCENTER/CATEGORIES/SAVE_CATEGORIES',
    UPDATE_CATEGORY = 'HELPCENTER/CATEGORIES/UPDATE_CATEGORY',
    DELETE_CATEGORY = 'HELPCENTER/CATEGORIES/DELETE_CATEGORY',
    RESET_CATEGORIES = 'HELPCENTER/CATEGORIES/RESET_CATEGORIES',

    PUSH_CATEGORY_LOCALES = 'HELPCENTER/CATEGORIES/PUSH_CATEGORY_LOCALES',
    REMOVE_CATEGORY_LOCALE = 'HELPCENTER/CATEGORIES/REMOVE_CATEGORY_LOCALE',

    UPDATE_CATEGORIES_ORDER = 'HELPCENTER/CATEGORIES/UPDATE_CATEGORIES_ORDER',
    UPDATE_CATEGORY_TRANSLATION = 'HELPCENTER/CATEGORIES/UPDATE_CATEGORY_TRANSLATION',
}

export type SaveCategoryAction = PayloadActionCreator<
    Category,
    CategoryActions.SAVE_CATEGORIES
>

export type UpdateCategoryAction = PayloadActionCreator<
    Category,
    CategoryActions.UPDATE_CATEGORY
>

export type UpdateCategoryTranslationAction = PayloadActionCreator<
    CategoryTranslation,
    CategoryActions.UPDATE_CATEGORY_TRANSLATION
>

export type DeleteCategoryAction = PayloadActionCreator<
    Category,
    CategoryActions.DELETE_CATEGORY
>

export type PushCategorySupportedLocales = PayloadActionCreator<
    {
        categoryId: number
        supportedLocales: LocaleCode[]
    },
    CategoryActions.PUSH_CATEGORY_LOCALES
>

export type RemoveCategorySupportedLocales = PayloadActionCreator<
    {
        categoryId: number
        locale: LocaleCode
    },
    CategoryActions.REMOVE_CATEGORY_LOCALE
>

export type UpdateCategoriesOrderAction = PayloadActionCreator<
    Category,
    CategoryActions.UPDATE_CATEGORIES_ORDER
>

export type ResetCategoriesAction = PayloadActionCreator<
    Category,
    CategoryActions.RESET_CATEGORIES
>

export type CategoriesAction =
    | SaveCategoryAction
    | UpdateCategoryAction
    | DeleteCategoryAction
    | UpdateCategoriesOrderAction
    | ResetCategoriesAction
    | UpdateCategoryTranslationAction
    | PushCategorySupportedLocales
    | RemoveCategorySupportedLocales

export type HelpCenterCategoriesState = {
    categoriesById: Record<number, Category>
}
