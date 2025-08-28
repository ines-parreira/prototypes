import { useCallback, useMemo, useState } from 'react'

import { FeatureFlagKey } from '@repo/feature-flags'

import { useFlag } from 'core/flags'

import { requestNotificationPermission } from '../requestNotificationPermission'

export default function useNotificationsContext() {
    const hasDesktopNotifications = useFlag(FeatureFlagKey.DesktopNotifications)
    const [isVisible, setIsVisible] = useState(false)

    const handleToggle = useCallback(() => {
        if (hasDesktopNotifications) {
            void requestNotificationPermission()
        }

        setIsVisible((v) => !v)
    }, [hasDesktopNotifications])

    return useMemo(
        () => [isVisible, handleToggle] as const,
        [handleToggle, isVisible],
    )
}
