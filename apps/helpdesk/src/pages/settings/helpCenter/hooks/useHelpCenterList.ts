import { useCallback, useEffect, useMemo, useState } from 'react'

import { reportError } from '@repo/logging'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import type { HelpCenter } from 'models/helpCenter/types'
import type { Paths } from 'rest_api/help_center_api/client.generated'
import {
    getHelpCenterFAQList,
    helpCentersFetched,
} from 'state/entities/helpCenter/helpCenters'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

import { useHelpCenterApi } from './useHelpCenterApi'

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
    params: Omit<Paths.ListHelpCenters.QueryParameters, 'page'>,
): HelpCenterListHook => {
    const dispatch = useAppDispatch()
    const helpCenters = useAppSelector(getHelpCenterFAQList)

    const { client } = useHelpCenterApi()
    const [isLoading, setLoading] = useState(true)
    const [pagination, setPagination] = useState<Pagination>({
        page: 0,
        nbPages: 1,
    })
    const hasMore = useMemo(
        () => pagination.page < pagination.nbPages,
        [pagination],
    )

    const fetchHelpCenters = useCallback(
        async (page: number) => {
            if (client) {
                try {
                    setLoading(true)

                    const {
                        data: { meta, data: fetchedHelpCenters },
                    } = await client.listHelpCenters({
                        ...params,
                        page: page + 1,
                        with_wizard: true,
                    })

                    dispatch(
                        helpCentersFetched([
                            ...helpCenters,
                            ...fetchedHelpCenters,
                        ]),
                    )

                    setPagination({ page: meta.page, nbPages: meta.nb_pages })
                } catch (err) {
                    void dispatch(
                        notify({
                            message: 'Failed to retrieve the Help Center list',
                            status: NotificationStatus.Error,
                        }),
                    )
                    reportError(err as Error)
                } finally {
                    setLoading(false)
                }
            }
        },
        [client, dispatch, helpCenters, params],
    )

    const fetchMore = useCallback(async () => {
        if (hasMore && !isLoading) {
            await fetchHelpCenters(pagination.page)
        }
    }, [fetchHelpCenters, hasMore, isLoading, pagination.page])

    useEffect(() => {
        if (client) {
            void fetchHelpCenters(0)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [client])

    return useMemo(
        () => ({ helpCenters, isLoading, hasMore, fetchMore }),
        [fetchMore, hasMore, helpCenters, isLoading],
    )
}
