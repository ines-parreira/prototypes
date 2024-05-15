import {KnockProvider, KnockFeedProvider} from '@knocklabs/react'
import React, {ReactNode, useMemo} from 'react'

import useAppSelector from 'hooks/useAppSelector'
import {getCurrentAccountId} from 'state/currentAccount/selectors'
import {getCurrentUserId} from 'state/currentUser/selectors'

import '@knocklabs/react/dist/index.css'

type Props = {
    children: ReactNode
}

const KNOCK_PUBLIC_KEY = 'pk_pBD7ZMpmXnfj37yQZsvC_9CE2zwk02lh8z8KE-iOAgs'
const KNOCK_FEED_ID = '975be13d-82a9-4ac4-b8d6-7b6abd4516ae'

export default function Provider({children}: Props) {
    const currentAccountId = useAppSelector(getCurrentAccountId)
    const currentUserId = useAppSelector(getCurrentUserId)

    const userId = useMemo(
        () => `${currentAccountId}.${currentUserId}`,
        [currentAccountId, currentUserId]
    )

    return (
        <KnockProvider apiKey={KNOCK_PUBLIC_KEY} userId={userId}>
            <KnockFeedProvider feedId={KNOCK_FEED_ID}>
                <>{children}</>
            </KnockFeedProvider>
        </KnockProvider>
    )
}
