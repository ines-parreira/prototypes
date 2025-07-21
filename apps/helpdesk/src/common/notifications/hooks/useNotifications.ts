import { useContext, useEffect } from 'react'

import Context from '../Context'
import type { Notification } from '../types'

export default function useNotifications(
    listener: (notification: Notification) => void,
) {
    const client = useContext(Context)
    if (!client) {
        throw new Error(
            '`useNotifications` may not be used outside of a `ClientProvider`',
        )
    }

    useEffect(() => {
        return client.subscribe(listener)
    }, [client, listener])
}
