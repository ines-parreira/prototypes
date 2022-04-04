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
import {getViewLanguage} from 'state/ui/helpCenter'
import useAppSelector from 'hooks/useAppSelector'

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
                const parentCategoryId = newCategory.parent_category_id
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
                    categoriesById[categoryId.toString()].parent_category_id
                const currentParentId = payload.parent_category_id || null
                if (previousParentId !== currentParentId) {
                    const categoriesToUpdate = getCategoriesToUpdate({
                        categories: categoriesById,
                        categoryId,
                        previousParentId,
                        currentParentId,
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

                dispatch(
                    pushCategorySupportedLocales({
                        categoryId,
                        supportedLocales: [payload.locale],
                    })
                )
                if (payload.locale === viewLanguage) {
                    dispatch(updateCategoryTranslation(translation.data))
                }

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
