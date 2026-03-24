import { useCallback, useMemo, useState } from 'react'

import { reportError } from '@repo/logging'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import type {
    CreateCategoryDto,
    CreateCategoryTranslationDto,
    LocaleCode,
    UpdateCategoryTranslationDto,
} from 'models/helpCenter/types'
import { flattenCategories } from 'models/helpCenter/utils'
import * as articleActions from 'state/entities/helpCenter/articles/actions'
import {
    deleteCategory as deleteCategoryAction,
    getCategoriesById,
    pushCategorySupportedLocales,
    removeLocaleFromCategory,
    saveCategories,
    savePositions,
    updateCategoriesArticleCount,
    updateCategoryTranslation as updateCategoryTranslationAction,
} from 'state/entities/helpCenter/categories'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import { getViewLanguage } from 'state/ui/helpCenter'

import type { CategoriesPositionsType } from '../components/CategoriesTable'
import { HELP_CENTER_ROOT_CATEGORY_ID } from '../constants'
import { getCategoriesToUpdate } from '../utils/getCategoriesToUpdate'
import useCurrentHelpCenter from './useCurrentHelpCenter'
import { useHelpCenterApi } from './useHelpCenterApi'

export const useCategoriesActions = () => {
    const helpCenter = useCurrentHelpCenter()
    const helpCenterId = helpCenter.id
    const dispatch = useAppDispatch()
    const { client } = useHelpCenterApi()
    const viewLanguage = useAppSelector(getViewLanguage)
    const [isLoading, setIsLoading] = useState(false)
    const categoriesById = useAppSelector(getCategoriesById)

    const getCategoryTranslation = useCallback(
        async (categoryId: number, locale: LocaleCode) => {
            if (!client) throw new Error('HTTP client not initialized!')

            try {
                setIsLoading(true)

                const { data } = await client.getCategory({
                    help_center_id: helpCenterId,
                    id: categoryId,
                    locale,
                })

                setIsLoading(false)

                return data.translation
            } catch (error) {
                setIsLoading(false)

                throw error
            }
        },
        [client, helpCenterId],
    )

    /**
     * Will fetch the articles for the passed parentCategoryId and all of its child categories.
     */
    const fetchCategoryArticleCount = useCallback(
        async (parentCategoryId: number | null, locale: LocaleCode) => {
            if (!client) throw new Error('HTTP client not initialized!')

            try {
                // Get just one level so that we can calculate the number of articles in child categories
                setIsLoading(true)
                const { data } = await client.getCategoryTree({
                    help_center_id: helpCenterId,
                    parent_category_id:
                        parentCategoryId ?? HELP_CENTER_ROOT_CATEGORY_ID,
                    order_by: 'position',
                    order_dir: 'asc',
                    locale,

                    depth: 1,
                    fields: ['articles'],
                })

                const flatCategories = flattenCategories(data)

                const categoryArticleCountList = flatCategories.map(
                    (category) => ({
                        categoryId: category.id,
                        articleCount: category.articles?.length ?? 0,
                    }),
                )
                dispatch(updateCategoriesArticleCount(categoryArticleCountList))
            } catch (err) {
                reportError(err as Error)
            } finally {
                setIsLoading(false)
            }
        },
        [client, dispatch, helpCenterId],
    )

    const fetchCategories = useCallback(
        async (
            locale: LocaleCode,
            parentCategoryId: number,
            shouldReset: boolean,
        ) => {
            if (!client) throw new Error('HTTP client not initialized!')

            try {
                setIsLoading(true)
                const { data } = await client.getCategoryTree({
                    help_center_id: helpCenterId,
                    parent_category_id: parentCategoryId,
                    depth: -1,
                    order_by: 'position',
                    order_dir: 'asc',
                    locale,
                })

                const flatCategories = flattenCategories(data)
                dispatch(
                    saveCategories({
                        categories: flatCategories,
                        shouldReset,
                    }),
                )
                await fetchCategoryArticleCount(parentCategoryId, locale)
            } catch (err) {
                reportError(err as Error)
            } finally {
                setIsLoading(false)
            }
        },
        [client, dispatch, fetchCategoryArticleCount, helpCenterId],
    )

    const createCategory = useCallback(
        async (payload: CreateCategoryDto) => {
            if (!client) throw new Error('HTTP client not initialized!')

            try {
                setIsLoading(true)

                const newCategory = await client
                    .createCategory(
                        {
                            help_center_id: helpCenterId,
                        },
                        payload,
                    )
                    .then((response) => response.data)
                const parentCategoryId =
                    newCategory.translation.parent_category_id
                const parentCategory =
                    categoriesById[
                        parentCategoryId ? parentCategoryId.toString() : '0'
                    ]

                dispatch(
                    saveCategories({
                        categories: [
                            { ...newCategory, children: [], articleCount: 0 },
                            {
                                ...parentCategory,
                                children: [
                                    ...parentCategory.children,
                                    newCategory.id,
                                ],
                            },
                        ],
                        shouldReset: false,
                    }),
                )

                setIsLoading(false)
            } catch (error) {
                setIsLoading(false)

                throw error
            }
        },
        [categoriesById, client, dispatch, helpCenterId],
    )

    const updateCategoryTranslation = useCallback(
        async (
            categoryId: number,
            locale: LocaleCode,
            payload: UpdateCategoryTranslationDto,
        ) => {
            if (!client) throw new Error('HTTP client not initialized!')

            try {
                setIsLoading(true)

                const translation = await client
                    .updateCategoryTranslation(
                        {
                            help_center_id: helpCenterId,
                            category_id: categoryId,
                            locale,
                        },
                        payload,
                    )
                    .then((response) => response.data)

                const output = translation

                const currentLocale =
                    categoriesById[categoryId].translation?.locale
                if (locale === currentLocale) {
                    dispatch(updateCategoryTranslationAction(output))
                }

                const previousParentId =
                    categoriesById[categoryId.toString()].translation
                        ?.parent_category_id ?? null
                const currentParentId = payload.parent_category_id || null
                if (previousParentId !== currentParentId) {
                    const categoriesToUpdate = getCategoriesToUpdate({
                        categories: categoriesById,
                        categoryId,
                        previousParentId,
                        currentParentId,
                        translation,
                    })

                    dispatch(
                        saveCategories({
                            categories: categoriesToUpdate,
                            shouldReset: false,
                        }),
                    )
                }

                setIsLoading(false)

                return output
            } catch (error) {
                setIsLoading(false)

                throw error
            }
        },
        [categoriesById, client, dispatch, helpCenterId],
    )

    const createCategoryTranslation = useCallback(
        async (categoryId: number, payload: CreateCategoryTranslationDto) => {
            if (!client) throw new Error('HTTP client not initialized!')

            try {
                setIsLoading(true)

                const translation = await client.createCategoryTranslation(
                    {
                        help_center_id: helpCenterId,
                        category_id: categoryId,
                    },
                    payload,
                )

                if (payload.locale === viewLanguage) {
                    dispatch(updateCategoryTranslationAction(translation.data))

                    const previousParentId =
                        categoriesById[categoryId].translation
                            ?.parent_category_id ?? null
                    const currentParentId =
                        translation.data.parent_category_id ?? null
                    if (previousParentId !== currentParentId) {
                        const categoriesToUpdate = getCategoriesToUpdate({
                            categories: categoriesById,
                            categoryId,
                            previousParentId,
                            currentParentId,
                            translation: translation.data,
                        })

                        dispatch(
                            saveCategories({
                                categories: categoriesToUpdate,
                                shouldReset: false,
                            }),
                        )
                    }
                }

                dispatch(
                    pushCategorySupportedLocales({
                        categoryId,
                        supportedLocales: [payload.locale],
                    }),
                )

                setIsLoading(false)

                return translation
            } catch (error) {
                setIsLoading(false)

                throw error
            }
        },
        [categoriesById, client, dispatch, helpCenterId, viewLanguage],
    )

    const updateCategoriesPositions = useCallback(
        async ({
            categories,
            categoryId,
            defaultSiblingsPositions,
        }: CategoriesPositionsType) => {
            if (!client) throw new Error('HTTP client not initialized!')

            try {
                setIsLoading(true)

                const positions = await client.setSubCategoriesPositions(
                    {
                        help_center_id: helpCenterId,
                        parent_category_id: categoryId,
                    },
                    categories,
                )
                dispatch(
                    savePositions({
                        children: categories,
                        categoryId,
                    }),
                )

                setIsLoading(false)
                void dispatch(
                    notify({
                        message: 'Categories reordered with success',
                        status: NotificationStatus.Success,
                    }),
                )

                return positions
            } catch (error) {
                dispatch(
                    savePositions({
                        children: defaultSiblingsPositions,
                        categoryId,
                    }),
                )
                setIsLoading(false)
                void dispatch(
                    notify({
                        message: 'Failed to reorder categories',
                        status: NotificationStatus.Error,
                    }),
                )

                throw error
            }
        },
        [client, dispatch, helpCenterId],
    )

    const deleteCategoryTranslation = useCallback(
        async (categoryId: number, locale: LocaleCode) => {
            if (!client) throw new Error('HTTP client not initialized!')

            try {
                setIsLoading(true)

                await client.deleteCategoryTranslation({
                    help_center_id: helpCenterId,
                    category_id: categoryId,
                    locale,
                })

                dispatch(removeLocaleFromCategory({ categoryId, locale }))

                if (locale === viewLanguage) {
                    const category = categoriesById[categoryId]
                    const availableLocales = category.available_locales.filter(
                        (availableLocale) => availableLocale !== locale,
                    )
                    if (!availableLocales.length) {
                        dispatch(deleteCategoryAction(categoryId))
                    } else {
                        const newLocale = availableLocales[0]
                        const { data } = await client.getCategory({
                            help_center_id: helpCenterId,
                            id: categoryId,
                            locale: newLocale,
                        })

                        dispatch(
                            updateCategoryTranslationAction(data.translation),
                        )
                    }
                }

                // in the case the children articles only had this locale they are deleted by the API but *asynchronously*
                // so we need to clean those manually from the state
                dispatch(
                    articleActions.cleanArticlesWithNoTranslation({
                        categoryId,
                        localeDeleted: locale,
                    }),
                )
                // When deleting a category locale, the API also removes the locale from children articles,
                // to avoid logic duplication and state drifts we just trigger a refetch of the articles
                // (we especially need that because sometimes for an article, its current translation in the state is the one just deleted)
                await dispatch(articleActions.reloadArticles(helpCenterId))

                setIsLoading(false)
            } catch (error) {
                setIsLoading(false)

                throw error
            }
        },
        [categoriesById, client, dispatch, helpCenterId, viewLanguage],
    )

    const deleteCategory = useCallback(
        async (categoryId: number) => {
            if (!client) throw new Error('HTTP client not initialized!')

            try {
                setIsLoading(true)

                await client.deleteCategoryArticles({
                    help_center_id: helpCenterId,
                    category_id: categoryId,
                })

                const response = await client.deleteCategory({
                    help_center_id: helpCenterId,
                    id: categoryId,
                })

                dispatch(deleteCategoryAction(categoryId))

                setIsLoading(false)

                return response
            } catch (error) {
                setIsLoading(false)

                throw error
            }
        },
        [client, dispatch, helpCenterId],
    )

    return useMemo(
        () => ({
            isLoading,
            getCategoryTranslation,
            fetchCategories,
            createCategory,
            updateCategoryTranslation,
            createCategoryTranslation,
            updateCategoriesPositions,
            deleteCategoryTranslation,
            deleteCategory,
            fetchCategoryArticleCount,
        }),
        [
            isLoading,
            createCategory,
            createCategoryTranslation,
            deleteCategory,
            deleteCategoryTranslation,
            fetchCategories,
            getCategoryTranslation,
            updateCategoriesPositions,
            updateCategoryTranslation,
            fetchCategoryArticleCount,
        ],
    )
}
