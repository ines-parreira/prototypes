import { useEffect } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { createViewCountScheduler } from '@repo/views'

import socketManager from 'services/socketManager/socketManager'
import { SocketEventType } from 'services/socketManager/types'

const scheduler = createViewCountScheduler({
    onRefresh: (viewIds) => {
        socketManager.send(SocketEventType.ViewsCountExpired, { viewIds })
    },
})

export default function useViewCountScheduler(): void {
    const isEnabled = useFlag(FeatureFlagKey.ImprovedViewCountUpdates)

    useEffect(() => {
        if (!isEnabled) return

        scheduler.start()

        function handleFocus() {
            scheduler.steal()
        }

        window.addEventListener('focus', handleFocus)

        return () => {
            window.removeEventListener('focus', handleFocus)
            scheduler.stop()
        }
    }, [isEnabled])
}
