import {useEffect, useState} from 'react'

import {Paths} from 'rest_api/help_center_api/client.generated'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import {Category} from 'models/helpCenter/types'
import {
    getCategories,
    saveCategories,
} from 'state/entities/helpCenter/categories'

import {flattenCategories} from 'models/helpCenter/utils'
import {useCurrentHelpCenter} from '../providers/CurrentHelpCenter'
import {useHelpCenterApi} from './useHelpCenterApi'

type HelpCenterCategoriesHook = {
    categories: Category[]
    isLoading: boolean
}

export const useHelpCenterCategories = (
    helpCenterId: number,
    params: Omit<Paths.ListCategories.QueryParameters, 'page'>
): HelpCenterCategoriesHook => {
    const dispatch = useAppDispatch()
    const categories = useAppSelector(getCategories)
    const helpCenter = useCurrentHelpCenter()

    const {client} = useHelpCenterApi()
    const [isLoading, setLoading] = useState(true)

    const fetchCategories = async () => {
        if (client) {
            try {
                setLoading(true)
                const {data} = await client.getCategoryTree({
                    help_center_id: helpCenterId,
                    parent_category_id: 0,
                    depth: -1,
                    order_by: 'position',
                    order_dir: 'asc',
                    locale: params.locale || helpCenter.default_locale,
                })

                const flatCategories = flattenCategories(data)
                dispatch(
                    saveCategories({
                        categories: flatCategories,
                        shouldReset: true,
                    })
                )
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
    }

    useEffect(() => {
        void fetchCategories()
    }, [params.locale])
    return {categories, isLoading}
}
