import React, {ReactNode, useCallback, useEffect} from 'react'
import {useParams} from 'react-router-dom'

import useAppDispatch from 'hooks/useAppDispatch'
import {useHelpCenterApi} from 'pages/settings/helpCenter/hooks/useHelpCenterApi'
import {helpCentersFetched} from 'state/entities/helpCenter/helpCenters'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {HELP_CENTER_MAX_CREATION} from 'pages/settings/helpCenter/constants'

type Props = {
    children?: ReactNode
}

const SelfServiceHelpCentersProvider = ({children}: Props) => {
    const {shopName} = useParams<{shopName: string}>()

    const {client} = useHelpCenterApi()
    const dispatch = useAppDispatch()

    const handleFetchHelpCenters = useCallback(async () => {
        if (!client) {
            return
        }

        try {
            const {
                data: {data: fetchedHelpCenters},
            } = await client.listHelpCenters({
                shop_name: shopName,
                per_page: HELP_CENTER_MAX_CREATION,
            })

            dispatch(helpCentersFetched(fetchedHelpCenters))
        } catch {
            void dispatch(
                notify({
                    message: 'Failed to fetch Help Centers',
                    status: NotificationStatus.Error,
                })
            )
        }
    }, [client, shopName, dispatch])

    useEffect(() => {
        void handleFetchHelpCenters()
    }, [handleFetchHelpCenters])

    return <>{children}</>
}

export default SelfServiceHelpCentersProvider
