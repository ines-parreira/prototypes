import {KnockProvider, KnockFeedProvider} from '@knocklabs/react'
import React, {ReactNode, useMemo} from 'react'

import useAppSelector from 'hooks/useAppSelector'
import {getCurrentAccountId} from 'state/currentAccount/selectors'
import {getCurrentUserId} from 'state/currentUser/selectors'

import useAuthentication from '../hooks/useAuthentication'

import '@knocklabs/react/dist/index.css'

type Props = {
    children: ReactNode
}

const KNOCK_FEED_ID = '975be13d-82a9-4ac4-b8d6-7b6abd4516ae'

export default function Provider({children}: Props) {
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
                <>{children}</>
            </KnockFeedProvider>
        </KnockProvider>
    )
}
