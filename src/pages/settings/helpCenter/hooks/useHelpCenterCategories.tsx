import {useEffect, useMemo, useState} from 'react'
import {useSelector} from 'react-redux'

import {Paths} from '../../../../../../../rest_api/help_center_api/client.generated'
import useAppDispatch from '../../../../hooks/useAppDispatch'
import {Category} from '../../../../models/helpCenter/types'
import {createCategoryFromDto} from '../../../../models/helpCenter/utils'
import {
    getCategories,
    saveCategories,
} from '../../../../state/helpCenter/categories'

import {useHelpCenterApi} from './useHelpCenterApi'

type HelpCenterCategoriesHook = {
    categories: Category[]
    isLoading: boolean
    hasMore: boolean
    fetchMore: () => Promise<void>
}

type Pagination = {
    page: number
    nbPages: number
}

export const useHelpCenterCategories = (
    helpCenterId: number,
    params: Omit<Paths.ListCategories.QueryParameters, 'page'>
): HelpCenterCategoriesHook => {
    const dispatch = useAppDispatch()
    const categories = useSelector(getCategories)

    const {client} = useHelpCenterApi()
    const [isLoading, setLoading] = useState(true)
    const [pagination, setPagination] = useState<Pagination>({
        page: 0,
        nbPages: 1,
    })
    const hasMore = useMemo(
        () => pagination.page < pagination.nbPages,
        [pagination]
    )

    const fetchCategories = async (page: number) => {
        if (client) {
            try {
                setLoading(true)

                const {
                    data: {meta, data},
                } = await client.listCategories({
                    ...params,
                    help_center_id: helpCenterId,
                    page: page + 1,
                    order_by: 'position',
                })

                const positions = await client
                    .getCategoriesPositions({
                        help_center_id: helpCenterId,
                    })
                    .then((response) => response.data)

                const fetchedCategories = data.map((category) =>
                    createCategoryFromDto(
                        category,
                        positions.findIndex((index) => index === category.id)
                    )
                )

                dispatch(saveCategories([...categories, ...fetchedCategories]))

                setPagination({page: meta.page, nbPages: meta.nb_pages})
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
    }

    const fetchMore = async () => {
        if (hasMore && !isLoading) {
            await fetchCategories(pagination.page)
        }
    }

    useEffect(() => {
        void fetchCategories(0)
    }, [params.locale])

    return {
        categories,
        isLoading,
        hasMore,
        fetchMore,
    }
}
