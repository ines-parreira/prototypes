import {chain as _chain} from 'lodash'

import {
    LocaleCode,
    CategoryTranslation,
    CreateCategoryDto,
    Category,
} from '../../../../models/helpCenter/types'
import {
    createCategoryFromDto,
    createCategoryTranslationFromDto,
} from '../../../../models/helpCenter/utils'
import useAppDispatch from '../../../../hooks/useAppDispatch'

import {
    deleteCategory,
    saveCategories,
    updateCategoriesOrder,
    updateCategoryTranslation,
} from '../../../../state/helpCenter/categories'

import {useHelpcenterApi} from './useHelpcenterApi'
import {useHelpCenterIdParam} from './useHelpCenterIdParam'

export const useCategoriesActions = () => {
    const helpCenterId = useHelpCenterIdParam()
    const dispatch = useAppDispatch()
    const {client} = useHelpcenterApi()

    return {
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
                ?.updateCategoryTranslation(
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

            dispatch(updateCategoryTranslation(output))

            return output
        },

        async updateCategoriesPosition(categories: Category[]) {
            if (!client) throw new Error('HTTP client not initialized!')

            const sortedCategories = _chain(categories)
                .sortBy(['position'])
                .map((category) => category.id)
                .value()

            const positions = await client
                .setCategoriesPositions(
                    {
                        help_center_id: helpCenterId,
                    },
                    sortedCategories
                )
                .then((response) => response.data)

            dispatch(updateCategoriesOrder(positions))

            return positions
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
