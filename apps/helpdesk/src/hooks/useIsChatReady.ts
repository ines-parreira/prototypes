import { useEffect, useState } from 'react'

const MAX_ATTEMPTS = 5
const RETRY_DELAY = 500

export function useIsChatReady(): boolean {
    const [isReady, setIsReady] = useState(false)

    useEffect(() => {
        let cancelled = false
        let attempts = 0
        let timeoutId: ReturnType<typeof setTimeout>

        function markReady() {
            if (!cancelled) setIsReady(true)
        }

        function trySubscribeOrRetry() {
            if (cancelled) return

            if (window.GorgiasChat) {
                window.GorgiasChat.on('ready', markReady)
                try {
                    if (typeof window.GorgiasChat.isOpen() === 'boolean') {
                        markReady()
                    }
                } catch {
                    // widget not yet fully initialized; wait for the ready event
                }
                return
            }

            if (attempts >= MAX_ATTEMPTS) return
            attempts++
            timeoutId = setTimeout(trySubscribeOrRetry, RETRY_DELAY * attempts)
        }

        const handleWidgetLoaded = () => {
            clearTimeout(timeoutId)
            trySubscribeOrRetry()
        }

        window.addEventListener('gorgias-widget-loaded', handleWidgetLoaded)
        trySubscribeOrRetry()

        return () => {
            cancelled = true
            clearTimeout(timeoutId)
            window.removeEventListener(
                'gorgias-widget-loaded',
                handleWidgetLoaded,
            )
        }
    }, [])

    return isReady
}
