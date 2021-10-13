import {useEffect, useState} from 'react'
import {useMountedState} from 'react-use'

import {LocaleCode} from '../../../../../../../models/helpCenter/types'
import {SelectableOption} from '../../../../../../common/forms/SelectField/types'

import {useHelpcenterApi} from '../../../../hooks/useHelpcenterApi'

interface UseCategoriesOptions {
    locale: LocaleCode
    helpCenterId: number
}

export const NO_CATEGORY_OPTION = 'null'

const useCategoriesOptions = ({locale, helpCenterId}: UseCategoriesOptions) => {
    const [options, setOptions] = useState<SelectableOption[]>([])
    const {client} = useHelpcenterApi()
    const isMounted = useMountedState()

    const loadCategories = async (): Promise<void> => {
        if (!client) {
            return
        }

        const {
            data: {data: categories},
        } = await client.listCategories({
            locale,
            help_center_id: helpCenterId,
            page: 1,
            per_page: 1000,
        })
        const newOptions = categories.map((category) => ({
            label: category.translation?.title,
            value: category.id,
        }))
        if (isMounted()) {
            setOptions([
                {label: '- No category -', value: NO_CATEGORY_OPTION},
                ...newOptions,
            ])
        }
    }

    useEffect(() => {
        void loadCategories()
    }, [locale])

    return options
}

export default useCategoriesOptions
