import { useState } from 'react'

import { useQuery } from '@tanstack/react-query'

const DEFAULT_CHECK_INTERVAL = 5000

export default function useMicrophonePermissions(
    refetchInterval = DEFAULT_CHECK_INTERVAL,
) {
    const [permissionState, setPermissionState] =
        useState<PermissionState | null>()

    const checkPermissions = async () => {
        try {
            const permission = await navigator.permissions.query({
                // @ts-ignore
                name: 'microphone',
            })

            setPermissionState(permission.state)

            return permission
        } catch {
            // Permission API not supported for older browser versions
            return null
        }
    }

    useQuery(['checkMicrophonePermissions'], checkPermissions, {
        enabled: permissionState !== 'granted',
        refetchInterval,
    })

    return { permissionDenied: permissionState === 'denied' }
}
