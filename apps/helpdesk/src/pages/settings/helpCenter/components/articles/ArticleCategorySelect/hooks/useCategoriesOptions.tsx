import React, { useMemo } from 'react'

import useAppSelector from 'hooks/useAppSelector'
import type {
    Category,
    LocaleCode,
    NonRootCategory,
} from 'models/helpCenter/types'
import { useHelpCenterCategories } from 'pages/settings/helpCenter/hooks/useHelpCenterCategories'
import {
    getCategoriesById,
    isNonRootCategory,
} from 'state/entities/helpCenter/categories'

import { getParentsInfo } from '../../../CategoryDropdownOptionLabel/CategoryDropdownOptionLabel'

interface UseCategoriesOptions {
    locale: LocaleCode
}

export type CategoryOption = {
    id: string
    value: number | null
    label: string
    textValue: string
    category?: NonRootCategory
}

export const NO_CATEGORY_VALUE = null
export const NO_CATEGORY_ID = 'no-category'

export const getCategoryDropdownOption = (
    category: NonRootCategory,
    categoriesById: Record<string, Category>,
): CategoryOption => {
    const title = category.translation?.title || ''
    const parentsInfo = categoriesById[category.id]
        ? getParentsInfo(category, categoriesById)
        : ''

    const label = parentsInfo ? `${title} (${parentsInfo})` : title

    return {
        id: `category-${category.id}`,
        value: category.id,
        label,
        textValue: title,
        category,
    }
}

export const getCategoryOptions = (
    categories: Category[],
    locale: LocaleCode,
    categoriesById: Record<string, Category>,
): CategoryOption[] => {
    const nonRootCategories = categories.filter(isNonRootCategory)
    const categoryOptions = nonRootCategories
        .filter((category) => category.available_locales.indexOf(locale) > -1)
        .map((category) => getCategoryDropdownOption(category, categoriesById))
    return [
        {
            id: NO_CATEGORY_ID,
            value: NO_CATEGORY_VALUE,
            label: '- no category -',
            textValue: '- no category -',
        },
        ...categoryOptions,
    ]
}

const useCategoriesOptions = ({
    locale,
}: UseCategoriesOptions): CategoryOption[] => {
    const { categories } = useHelpCenterCategories({
        locale,
    })
    const categoriesById = useAppSelector(getCategoriesById)

    const options = useMemo(
        () => getCategoryOptions(categories, locale, categoriesById),
        [locale, categories, categoriesById],
    )
    return options
}

export default useCategoriesOptions
