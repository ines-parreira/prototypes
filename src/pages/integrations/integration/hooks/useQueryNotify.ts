import {useEffect} from 'react'

import useSearch from 'hooks/useSearch'
import {NotificationStatus} from 'state/notifications/types'
import useAppDispatch from 'hooks/useAppDispatch'
import {notify} from 'state/notifications/actions'

// Display a notification based on some query params
export default function useQueryNotify() {
    const dispatch = useAppDispatch()
    const search = useSearch<{
        error?: string
        message?: string
        message_type?: NotificationStatus
    }>()
    useEffect(() => {
        const {message, message_type, error} = search

        if (error === 'need_scope_update') {
            void dispatch(
                notify({
                    status: message_type || NotificationStatus.Error,
                    message:
                        'You need to update your app permissions in order to do that.',
                })
            )
        }

        if (message) {
            void dispatch(
                notify({
                    status: message_type || NotificationStatus.Info,
                    message: decodeURIComponent(message.replace(/\+/g, ' ')),
                })
            )
        }
    }, [dispatch, search])
}
