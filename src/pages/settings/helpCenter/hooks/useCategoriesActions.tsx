import {chain as _chain} from 'lodash'
import {useState} from 'react'
import {useSelector} from 'react-redux'

import {notify} from '../../../../state/notifications/actions'
import {NotificationStatus} from '../../../../state/notifications/types'
import {
    Category,
    CreateCategoryDto,
    CreateCategoryTranslationDto,
    LocaleCode,
    UpdateCategoryTranslationDto,
} from '../../../../models/helpCenter/types'
import {createCategoryFromDto} from '../../../../models/helpCenter/utils'
import useAppDispatch from '../../../../hooks/useAppDispatch'
import {
    deleteCategory,
    pushCategorySupportedLocales,
    removeLocaleFromCategory,
    saveCategories,
    updateCategoriesOrder,
    updateCategoryTranslation,
} from '../../../../state/helpCenter/categories'
import {getViewLanguage} from '../../../../state/helpCenter/ui'

import {useHelpCenterApi} from './useHelpCenterApi'
import {useHelpCenterIdParam} from './useHelpCenterIdParam'

export const useCategoriesActions = () => {
    const helpCenterId = useHelpCenterIdParam()
    const dispatch = useAppDispatch()
    const {client} = useHelpCenterApi()
    const viewLanguage = useSelector(getViewLanguage)
    const [isLoading, setIsLoading] = useState(false)

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

                const position = await client
                    .getCategoriesPositions({
                        help_center_id: helpCenterId,
                    })
                    .then((response) => response.data)
                    .then((positions) =>
                        positions.findIndex(
                            (categoryId) => categoryId === newCategory.id
                        )
                    )

                const output = createCategoryFromDto(newCategory, position)

                dispatch(saveCategories([output]))

                setIsLoading(false)

                return output
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

                if (locale === viewLanguage) {
                    dispatch(updateCategoryTranslation(output))
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

                if (payload.locale !== viewLanguage) {
                    dispatch(
                        pushCategorySupportedLocales({
                            categoryId,
                            supportedLocales: [payload.locale],
                        })
                    )
                }

                setIsLoading(false)

                return translation
            } catch (error) {
                setIsLoading(false)

                throw error
            }
        },

        async updateCategoriesPositions(categories: Category[]) {
            if (!client) throw new Error('HTTP client not initialized!')

            try {
                setIsLoading(true)

                const {data: previousPositions} =
                    await client.getCategoriesPositions({
                        help_center_id: helpCenterId,
                    })

                const sortedCategories = _chain(categories)
                    .sortBy(['position'])
                    .map((category) => category.id)
                    .value()

                // This allows to sort only a subset of categories (when using pagination for example)
                const categoriesPositions = Array.from(
                    new Set([...sortedCategories, ...previousPositions])
                )

                const positions = await client
                    .setCategoriesPositions(
                        {
                            help_center_id: helpCenterId,
                        },
                        categoriesPositions
                    )
                    .then((response) => response.data)

                dispatch(
                    updateCategoriesOrder(
                        positions.filter((categoryId) =>
                            sortedCategories.includes(categoryId)
                        )
                    )
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
                    dispatch(deleteCategory(categoryId))
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
