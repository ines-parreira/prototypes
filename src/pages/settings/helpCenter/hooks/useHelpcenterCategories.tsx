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

import {useHelpcenterApi} from './useHelpcenterApi'

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
    queryParams: Omit<Paths.ListCategories.QueryParameters, 'page'>
): HelpCenterCategoriesHook => {
    const dispatch = useAppDispatch()
    const categories = useSelector(getCategories)

    const {client} = useHelpcenterApi()
    const [isLoading, setLoading] = useState(true)
    const [pagination, setPagination] = useState<Pagination>({
        page: 0,
        nbPages: 1,
    })
    const hasMore = useMemo(() => pagination.page < pagination.nbPages, [
        pagination,
    ])

    const fetchCategories = async () => {
        let {page, nbPages} = pagination

        if (client) {
            try {
                setLoading(true)

                const {
                    data: {meta, data},
                } = await client.listCategories({
                    ...queryParams,
                    help_center_id: helpCenterId,
                    page: pagination.page + 1,
                    order_by: 'position',
                })

                page = meta.page
                nbPages = meta.nb_pages

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
            } catch (err) {
                console.error(err)
            } finally {
                setPagination({page, nbPages})
                setLoading(false)
            }
        }
    }

    const fetchMore = async () => {
        if (hasMore && !isLoading) {
            await fetchCategories()
        }
    }

    useEffect(() => {
        void fetchCategories()
    }, [])

    return {
        categories,
        isLoading,
        hasMore,
        fetchMore,
    }
}
