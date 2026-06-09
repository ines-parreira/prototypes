import { useRealtimeAccountSubscription } from '@gorgias/realtime'

import { INITIAL_ACCOUNT_CONNECTION_PRESENCE_DATA } from './constants'
import type { AccountConnectionPresenceData } from './types'
import { useAccountConnectionActivity } from './useAccountConnectionActivity'

export function useRealtimeAccountPresenceSubscription() {
    const { updatePresenceData } =
        useRealtimeAccountSubscription<AccountConnectionPresenceData>({
            initialPresenceData: INITIAL_ACCOUNT_CONNECTION_PRESENCE_DATA,
        })

    useAccountConnectionActivity(updatePresenceData)
}
