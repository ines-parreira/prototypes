import {useState} from 'react'

import useInterval from 'hooks/useInterval'

export default function useMicrophonePermissions() {
    const [permissionDenied, setPermissionDenied] = useState(false)

    const checkPermissions = async () => {
        try {
            const permission = await navigator.permissions.query({
                // @ts-ignore
                name: 'microphone',
            })
            if (permission.state === 'granted') {
                setPermissionDenied(false)
            } else {
                setPermissionDenied(true)
            }
        } catch {
            // Permission API not supported for older browser versions
        }
    }

    useInterval(() => {
        void checkPermissions()
    }, 5000)

    return {permissionDenied}
}
