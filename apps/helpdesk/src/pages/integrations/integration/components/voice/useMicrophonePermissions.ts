import { useState } from 'react'
import { Duration } from '@gorgias/toolkit'

import { useQuery } from '@tanstack/react-query'

export function useMicrophonePermissions(
    refetchInterval = Duration.seconds(5),
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
