import {useMemo} from 'react'
import {useHelpCenterCategories} from 'pages/settings/helpCenter/hooks/useHelpCenterCategories'
import {LocaleCode} from '../../../../../../../models/helpCenter/types'

interface UseCategoriesOptions {
    locale: LocaleCode
    helpCenterId: number
}

export const NO_CATEGORY_OPTION = 'null'

const useCategoriesOptions = ({locale, helpCenterId}: UseCategoriesOptions) => {
    const {categories} = useHelpCenterCategories(helpCenterId, {
        locale,
        per_page: 1000,
    })
    const options = useMemo(() => {
        const newOptions = categories.map((category) => ({
            label: category.translation.title,
            value: category.id,
        }))
        return [
            {label: '- No category -', value: NO_CATEGORY_OPTION},
            ...newOptions,
        ]
    }, [categories])
    return options
}

export default useCategoriesOptions
