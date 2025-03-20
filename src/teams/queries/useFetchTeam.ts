import { useEffect } from 'react'

import { useGetTeam } from '@gorgias/api-queries'

import useAppDispatch from 'hooks/useAppDispatch'
import { GorgiasApiError } from 'models/api/types'
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
                    title: (response.error as GorgiasApiError).response.data
                        .error.msg,
                    message: errorToChildren(response.error)!,
                    allowHTML: true,
                    status: NotificationStatus.Error,
                }),
            )
        }
    }, [dispatch, response])

    return response
}
