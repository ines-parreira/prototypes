import { useCallback, useMemo, useState } from 'react'

import { requestNotificationPermission } from '../requestNotificationPermission'

export default function useNotificationsContext() {
    const [isVisible, setIsVisible] = useState(false)

    const handleToggle = useCallback(() => {
        void requestNotificationPermission()
        setIsVisible((v) => !v)
    }, [])

    return useMemo(
        () => [isVisible, handleToggle] as const,
        [handleToggle, isVisible],
    )
}
