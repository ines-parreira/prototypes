import React, {useMemo} from 'react'
import {useHelpCenterCategories} from 'pages/settings/helpCenter/hooks/useHelpCenterCategories'
import {LocaleCode, NonRootCategory} from 'models/helpCenter/types'
import {isNonRootCategory} from 'state/entities/helpCenter/categories'
import {Option} from 'pages/common/forms/SelectField/types'
import {CategoryDropdownOptionLabel} from '../../../CategoryDropdownOptionLabel/CategoryDropdownOptionLabel'

interface UseCategoriesOptions {
    locale: LocaleCode
}

export const NO_CATEGORY_OPTION = 'null'

export const getCategoryDropdownOption = (
    category: NonRootCategory
): Option => {
    return {
        label: <CategoryDropdownOptionLabel category={category} />,
        text: category.translation?.title,
        value: category.id,
    }
}

const useCategoriesOptions = ({locale}: UseCategoriesOptions) => {
    const {categories} = useHelpCenterCategories({
        locale,
    })

    const options = useMemo(() => {
        const nonRootCategories = categories.filter(isNonRootCategory)
        const newOptions = nonRootCategories
            .filter(
                (category) => category.available_locales.indexOf(locale) > -1
            )
            .map((category) => getCategoryDropdownOption(category))
        return [
            {label: '- No category -', value: NO_CATEGORY_OPTION},
            ...newOptions,
        ]
    }, [locale, categories])
    return options
}

export default useCategoriesOptions
