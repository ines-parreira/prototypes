import {useState} from 'react'

import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {
    CreateCategoryDto,
    CreateCategoryTranslationDto,
    LocaleCode,
    UpdateCategoryTranslationDto,
} from 'models/helpCenter/types'
import useAppDispatch from 'hooks/useAppDispatch'
import {
    deleteCategory,
    getCategoriesById,
    pushCategorySupportedLocales,
    removeLocaleFromCategory,
    saveCategories,
    savePositions,
    updateCategoryTranslation,
} from 'state/entities/helpCenter/categories'
import * as articleActions from 'state/entities/helpCenter/articles/actions'
import {getViewLanguage} from 'state/ui/helpCenter'
import useAppSelector from 'hooks/useAppSelector'
import {flattenCategories} from 'models/helpCenter/utils'

import {CategoriesPositionsType} from '../components/CategoriesTable'
import {getCategoriesToUpdate} from '../utils/getCategoriesToUpdate'
import {useHelpCenterApi} from './useHelpCenterApi'
import {useHelpCenterIdParam} from './useHelpCenterIdParam'

export const useCategoriesActions = () => {
    const helpCenterId = useHelpCenterIdParam()
    const dispatch = useAppDispatch()
    const {client} = useHelpCenterApi()
    const viewLanguage = useAppSelector(getViewLanguage)
    const [isLoading, setIsLoading] = useState(false)
    const categoriesById = useAppSelector(getCategoriesById)

    return {
        isLoading,

        async getCategoryTranslation(categoryId: number, locale: LocaleCode) {
            if (!client) throw new Error('HTTP client not initialized!')

            try {
                setIsLoading(true)

                const {data} = await client.getCategory({
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

        async fetchCategories(
            locale: LocaleCode,
            parentCategoryId: number,
            shouldReset: boolean
        ) {
            if (!client) throw new Error('HTTP client not initialized!')

            try {
                setIsLoading(true)
                const {data} = await client.getCategoryTree({
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
                    })
                )
            } catch (err) {
                console.error(err)
            } finally {
                setIsLoading(false)
            }
        },

        async createCategory(payload: CreateCategoryDto) {
            if (!client) throw new Error('HTTP client not initialized!')

            try {
                setIsLoading(true)

                const newCategory = await client
                    .createCategory(
                        {
                            help_center_id: helpCenterId,
                        },
                        payload
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
                            {...newCategory, children: []},
                            {
                                ...parentCategory,
                                children: [
                                    ...parentCategory.children,
                                    newCategory.id,
                                ],
                            },
                        ],
                        shouldReset: false,
                    })
                )

                setIsLoading(false)
            } catch (error) {
                setIsLoading(false)

                throw error
            }
        },

        async updateCategoryTranslation(
            categoryId: number,
            locale: LocaleCode,
            payload: UpdateCategoryTranslationDto
        ) {
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
                        payload
                    )
                    .then((response) => response.data)

                const output = translation

                const currentLocale =
                    categoriesById[categoryId].translation?.locale
                if (locale === currentLocale) {
                    dispatch(updateCategoryTranslation(output))
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
                        })
                    )
                }

                setIsLoading(false)

                return output
            } catch (error) {
                setIsLoading(false)

                throw error
            }
        },

        async createCategoryTranslation(
            categoryId: number,
            payload: CreateCategoryTranslationDto
        ) {
            if (!client) throw new Error('HTTP client not initialized!')

            try {
                setIsLoading(true)

                const translation = await client.createCategoryTranslation(
                    {
                        help_center_id: helpCenterId,
                        category_id: categoryId,
                    },
                    payload
                )

                if (payload.locale === viewLanguage) {
                    dispatch(updateCategoryTranslation(translation.data))

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
                            })
                        )
                    }
                }

                dispatch(
                    pushCategorySupportedLocales({
                        categoryId,
                        supportedLocales: [payload.locale],
                    })
                )

                setIsLoading(false)

                return translation
            } catch (error) {
                setIsLoading(false)

                throw error
            }
        },

        async updateCategoriesPositions({
            categories,
            categoryId,
            defaultSiblingsPositions,
        }: CategoriesPositionsType) {
            if (!client) throw new Error('HTTP client not initialized!')

            try {
                setIsLoading(true)

                const positions = await client.setSubCategoriesPositions(
                    {
                        help_center_id: helpCenterId,
                        parent_category_id: categoryId,
                    },
                    categories
                )
                dispatch(
                    savePositions({
                        children: categories,
                        categoryId,
                    })
                )

                setIsLoading(false)
                void dispatch(
                    notify({
                        message: 'Categories reordered with success',
                        status: NotificationStatus.Success,
                    })
                )

                return positions
            } catch (error) {
                dispatch(
                    savePositions({
                        children: defaultSiblingsPositions,
                        categoryId,
                    })
                )
                setIsLoading(false)
                void dispatch(
                    notify({
                        message: 'Failed to reorder categories',
                        status: NotificationStatus.Error,
                    })
                )

                throw error
            }
        },

        async deleteCategoryTranslation(
            categoryId: number,
            locale: LocaleCode
        ) {
            if (!client) throw new Error('HTTP client not initialized!')

            try {
                setIsLoading(true)

                await client.deleteCategoryTranslation({
                    help_center_id: helpCenterId,
                    category_id: categoryId,
                    locale,
                })

                dispatch(removeLocaleFromCategory({categoryId, locale}))

                if (locale === viewLanguage) {
                    const category = categoriesById[categoryId]
                    const availableLocales = category.available_locales.filter(
                        (availableLocale) => availableLocale !== locale
                    )
                    if (!availableLocales.length) {
                        dispatch(deleteCategory(categoryId))
                    } else {
                        const newLocale = availableLocales[0]
                        const {data} = await client.getCategory({
                            help_center_id: helpCenterId,
                            id: categoryId,
                            locale: newLocale,
                        })

                        dispatch(updateCategoryTranslation(data.translation))
                    }
                }

                // in the case the children articles only had this locale they are deleted by the API but *asynchronously*
                // so we need to clean those manually from the state
                dispatch(
                    articleActions.cleanArticlesWithNoTranslation({
                        categoryId,
                        localeDeleted: locale,
                    })
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

        async deleteCategory(categoryId: number) {
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

                dispatch(deleteCategory(categoryId))

                setIsLoading(false)

                return response
            } catch (error) {
                setIsLoading(false)

                throw error
            }
        },
    }
}
