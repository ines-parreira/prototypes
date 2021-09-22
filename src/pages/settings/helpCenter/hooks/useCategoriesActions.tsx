import {chain as _chain} from 'lodash'
import {useSelector} from 'react-redux'

import {
    LocaleCode,
    CategoryTranslation,
    CreateCategoryDto,
    Category,
    CreateCategoryTranslationBody,
} from '../../../../models/helpCenter/types'
import {
    createCategoryFromDto,
    createCategoryTranslationFromDto,
} from '../../../../models/helpCenter/utils'
import useAppDispatch from '../../../../hooks/useAppDispatch'

import {
    deleteCategory,
    pushCategorySupportedLocales,
    removeLocaleFromCategory,
    saveCategories,
    updateCategoriesOrder,
    updateCategoryTranslation,
} from '../../../../state/helpCenter/categories'
import {readViewLanguage} from '../../../../state/helpCenter/ui'

import {useHelpcenterApi} from './useHelpcenterApi'
import {useHelpCenterIdParam} from './useHelpCenterIdParam'

export const useCategoriesActions = () => {
    const helpCenterId = useHelpCenterIdParam()
    const dispatch = useAppDispatch()
    const {client} = useHelpcenterApi()
    const viewLanguage = useSelector(readViewLanguage)

    return {
        async getCategoryTranslation(categoryId: number, locale: LocaleCode) {
            if (!client) throw new Error('HTTP client not initialized!')

            return client
                .getCategory({
                    help_center_id: helpCenterId,
                    id: categoryId,
                    locale,
                })
                .then((response) => {
                    const {data} = response

                    if (data?.translation) {
                        return data.translation
                    }

                    throw new Error('Category translation missing')
                })
        },

        async createCategory(payload: CreateCategoryDto) {
            if (!client) throw new Error('HTTP client not initialized!')

            const newCategory = await client
                ?.createCategory(
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

            return output
        },

        async updateCategoryTranslation(
            categoryId: number,
            locale: LocaleCode,
            payload: Partial<CategoryTranslation>
        ) {
            if (!client) throw new Error('HTTP client not initialized!')

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
                .then(createCategoryTranslationFromDto)

            const output = translation

            if (locale === viewLanguage) {
                dispatch(updateCategoryTranslation(output))
            }

            return output
        },

        async createCategoryTranslation(
            categoryId: number,
            payload: CreateCategoryTranslationBody
        ) {
            if (!client) throw new Error('HTTP client not initialized!')

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

            return translation
        },

        async updateCategoriesPositions(categories: Category[]) {
            if (!client) throw new Error('HTTP client not initialized!')

            const {
                data: previousPositions,
            } = await client.getCategoriesPositions({
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

            return positions
        },

        async deleteCategoryTranslation(
            categoryId: number,
            locale: LocaleCode
        ) {
            if (!client) throw new Error('HTTP client not initialized!')

            await client.deleteCategoryTranslation({
                help_center_id: helpCenterId,
                category_id: categoryId,
                locale,
            })

            dispatch(removeLocaleFromCategory({categoryId, locale}))

            if (locale === viewLanguage) {
                dispatch(deleteCategory(categoryId))
            }
        },

        async deleteCategory(categoryId: number) {
            if (!client) throw new Error('HTTP client not initialized!')

            const response = await client.deleteCategory({
                help_center_id: helpCenterId,
                id: categoryId,
            })

            dispatch(deleteCategory(categoryId))

            return response
        },
    }
}
