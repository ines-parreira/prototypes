import {useEffect, useState} from 'react'

import {Paths} from 'rest_api/help_center_api/client.generated'

import useAppSelector from 'hooks/useAppSelector'
import {Category} from 'models/helpCenter/types'
import {getCategories} from 'state/entities/helpCenter/categories'

import {useCurrentHelpCenter} from '../providers/CurrentHelpCenter'
import {useCategoriesActions} from './useCategoriesActions'

type HelpCenterCategoriesHook = {
    categories: Category[]
    isLoading: boolean
}

export const useHelpCenterCategories = (
    params: Omit<Paths.ListCategories.QueryParameters, 'page'>
): HelpCenterCategoriesHook => {
    const categories = useAppSelector(getCategories)
    const helpCenter = useCurrentHelpCenter()
    const actions = useCategoriesActions()
    const [isLoading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchCategories() {
            setLoading(true)
            await actions.fetchCategories(
                params.locale || helpCenter.default_locale,
                0,
                true
            )

            setLoading(false)
        }

        void fetchCategories()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [params.locale])
    return {categories, isLoading}
}
