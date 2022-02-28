import {useEffect, useMemo, useState} from 'react'
import {useSelector} from 'react-redux'

import {Paths} from 'rest_api/help_center_api/client.generated'

import useAppDispatch from 'hooks/useAppDispatch'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {HelpCenter} from 'models/helpCenter/types'
import {
    getHelpCenters,
    helpCentersFetched,
} from 'state/entities/helpCenter/helpCenters'

import {useHelpCenterApi} from './useHelpCenterApi'

type HelpCenterListHook = {
    helpCenters: HelpCenter[]
    isLoading: boolean
    hasMore: boolean
    fetchMore: () => Promise<void>
}

type Pagination = {
    page: number
    nbPages: number
}

export const useHelpCenterList = (
    params: Omit<Paths.ListHelpCenters.QueryParameters, 'page'>
): HelpCenterListHook => {
    const dispatch = useAppDispatch()
    const helpCenters = Object.values(useSelector(getHelpCenters)).map(
        (hc) => hc
    )

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

    const fetchHelpCenters = async (page: number) => {
        if (client) {
            try {
                setLoading(true)

                const {
                    data: {meta, data: fetchedHelpCenters},
                } = await client.listHelpCenters({
                    ...params,
                    page: page + 1,
                })

                dispatch(
                    helpCentersFetched([...helpCenters, ...fetchedHelpCenters])
                )

                setPagination({page: meta.page, nbPages: meta.nb_pages})
            } catch (err) {
                void dispatch(
                    notify({
                        message: 'Failed to retrieve the Help Center list',
                        status: NotificationStatus.Error,
                    })
                )
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
    }

    const fetchMore = async () => {
        if (hasMore && !isLoading) {
            await fetchHelpCenters(pagination.page)
        }
    }

    useEffect(() => {
        if (client) {
            void fetchHelpCenters(0)
        }
    }, [client])

    return {helpCenters, isLoading, hasMore, fetchMore}
}
