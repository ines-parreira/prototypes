import {KnockFeedProvider, KnockProvider} from '@knocklabs/react'
import React, {ReactNode, useMemo} from 'react'

import useAppSelector from 'hooks/useAppSelector'
import {getCurrentAccountId} from 'state/currentAccount/selectors'
import {getCurrentUserId} from 'state/currentUser/selectors'

import useAuthentication from '../hooks/useAuthentication'
import useNotificationsContext from '../hooks/useNotificationsContext'
import OverlayContext from '../OverlayContext'
import ClientProvider from './ClientProvider'

import '@knocklabs/react/dist/index.css'

type Props = {
    children: ReactNode
}

export const KNOCK_FEED_ID = '975be13d-82a9-4ac4-b8d6-7b6abd4516ae'

export default function Provider({children}: Props) {
    const ctx = useNotificationsContext()

    const currentAccountId = useAppSelector(getCurrentAccountId)
    const currentUserId = useAppSelector(getCurrentUserId)

    const {userToken, apiKey, refreshToken} = useAuthentication()

    const userId = useMemo(
        () => `${currentAccountId}.${currentUserId}`,
        [currentAccountId, currentUserId]
    )

    return (
        <KnockProvider
            apiKey={apiKey}
            userId={userId}
            userToken={userToken}
            onUserTokenExpiring={refreshToken}
        >
            <KnockFeedProvider feedId={KNOCK_FEED_ID}>
                <ClientProvider>
                    <OverlayContext.Provider value={ctx}>
                        {children}
                    </OverlayContext.Provider>
                </ClientProvider>
            </KnockFeedProvider>
        </KnockProvider>
    )
}
