import React, {ReactNode, useCallback, useEffect} from 'react'

import useAppDispatch from 'hooks/useAppDispatch'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {useContactFormApi} from 'pages/settings/contactForm/hooks/useContactFormApi'

type Props = {
    children?: ReactNode
}

const SelfServiceContactFormsProvider = ({children}: Props) => {
    const {isReady, fetchPaginatedContactForms} = useContactFormApi()
    const dispatch = useAppDispatch()

    const handleFetchContactForms = useCallback(async () => {
        try {
            await fetchPaginatedContactForms()
        } catch (e) {
            console.error(e)
            void dispatch(
                notify({
                    message: 'Failed to fetch Contact Forms',
                    status: NotificationStatus.Error,
                })
            )
        }
    }, [fetchPaginatedContactForms, dispatch])

    useEffect(() => {
        if (isReady) {
            void handleFetchContactForms()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isReady])

    return <>{children}</>
}

export default SelfServiceContactFormsProvider
