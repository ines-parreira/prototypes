import { useEffect, useState } from 'react'

export function useIsChatReady(): boolean {
    const [isReady, setIsReady] = useState(() => !!window.GorgiasChat)

    useEffect(() => {
        if (window.GorgiasChat) {
            setIsReady(true)
            return
        }

        const handleWidgetLoaded = () => {
            window.GorgiasChat?.on('ready', () => setIsReady(true))
        }

        window.addEventListener('gorgias-widget-loaded', handleWidgetLoaded)
        return () =>
            window.removeEventListener(
                'gorgias-widget-loaded',
                handleWidgetLoaded,
            )
    }, [])

    return isReady
}
