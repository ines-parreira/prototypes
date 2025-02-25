import { useEffect } from 'react'

import { Map } from 'immutable'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { handleUsageBanner } from 'state/notifications/actions'

export function useUsageBanner() {
    const dispatch = useAppDispatch()
    const currentAccount = useAppSelector((state) => state.currentAccount)

    useEffect(() => {
        const newAccountStatus = currentAccount.getIn(['status', 'status'])
        const notification: Map<any, any> | undefined = currentAccount.getIn([
            'status',
            'notification',
        ])

        dispatch(
            handleUsageBanner({
                newAccountStatus,
                currentAccountStatus: newAccountStatus,
                notification: notification ? notification.toJS() : null,
            }),
        )
    }, [currentAccount, dispatch])
}
