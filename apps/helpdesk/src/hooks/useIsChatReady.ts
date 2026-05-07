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
                try {
                    window.GorgiasChat.on('ready', markReady)
                    if (typeof window.GorgiasChat.isOpen() === 'boolean') {
                        markReady()
                    }
                } catch {
                    // GorgiasChat object exists but API not yet initialized; retry
                    if (attempts < MAX_ATTEMPTS) {
                        attempts++
                        timeoutId = setTimeout(
                            trySubscribeOrRetry,
                            RETRY_DELAY * attempts,
                        )
                    }
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
