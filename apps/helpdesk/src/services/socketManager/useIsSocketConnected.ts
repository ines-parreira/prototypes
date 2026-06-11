import { useSyncExternalStore } from 'react'

import { socketManager } from './socketManager'

export function useIsSocketConnected(): boolean {
    return useSyncExternalStore(
        socketManager.subscribeToConnection,
        () => socketManager.isConnected,
        () => false,
    )
}
