import { useCallback, useMemo, useState } from 'react'

export default function useNotificationsContext() {
    const [isVisible, setIsVisible] = useState(false)

    const handleToggle = useCallback(() => {
        setIsVisible((v) => !v)
    }, [])

    return useMemo(
        () => [isVisible, handleToggle] as const,
        [handleToggle, isVisible],
    )
}
