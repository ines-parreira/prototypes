import { useEffect } from 'react'

import {
    createViewCountScheduler,
    setActiveViewFallback,
    useDefaultView,
    useHasNewViewCountScheduler,
    useSchedulerConfig,
} from '@repo/views'

import socketManager from 'services/socketManager/socketManager'
import { SocketEventType } from 'services/socketManager/types'

export default function useViewCountScheduler(): void {
    const { value: isEnabled } = useHasNewViewCountScheduler()
    const config = useSchedulerConfig()
    const defaultView = useDefaultView()

    useEffect(() => {
        setActiveViewFallback(defaultView?.id ?? null)
    }, [defaultView])

    useEffect(() => {
        if (!isEnabled) return

        const scheduler = createViewCountScheduler({
            onRefresh: (viewIds) => {
                socketManager.send(SocketEventType.ViewsCountExpired, {
                    viewIds,
                })
            },
            config,
        })
        scheduler.start()

        function handleFocus() {
            scheduler.steal()
        }

        window.addEventListener('focus', handleFocus)

        return () => {
            window.removeEventListener('focus', handleFocus)
            scheduler.stop()
        }
    }, [isEnabled, config])
}
