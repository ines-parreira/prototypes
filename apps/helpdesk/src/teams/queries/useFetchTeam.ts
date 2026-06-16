import { useEffect } from 'react'

import { useGetTeam } from '@gorgias/helpdesk-queries'

import { useAppDispatch } from 'hooks/useAppDispatch'
import { isGorgiasApiError } from 'models/api/types'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import { errorToChildren } from 'utils'

export function useFetchTeam(id: number) {
    const dispatch = useAppDispatch()

    const response = useGetTeam(id)

    useEffect(() => {
        if (response.isError) {
            void dispatch(
                notify({
                    title: isGorgiasApiError(response.error)
                        ? response.error.response.data.error.msg
                        : 'Failed to fetch team',
                    message: errorToChildren(response.error)!,
                    allowHTML: true,
                    status: NotificationStatus.Error,
                }),
            )
        }
    }, [dispatch, response])

    return response
}
