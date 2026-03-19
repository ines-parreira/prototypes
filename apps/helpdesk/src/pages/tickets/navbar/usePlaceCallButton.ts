import { useEffect, useState } from 'react'

import { isDesktopDevice, useConditionalShortcuts } from '@repo/utils'
import { isDeviceReady } from '@repo/voice'

import useVoiceDevice from 'hooks/integrations/phone/useVoiceDevice'
import useHasPhone from 'hooks/useHasPhone'
import useMicrophonePermissions from 'pages/integrations/integration/components/voice/useMicrophonePermissions'

export function usePlaceCallButton() {
    const [isDeviceVisible, setIsDeviceVisible] = useState(false)
    const { device } = useVoiceDevice()
    const hasPhone = useHasPhone()

    const shouldDisplayButton = hasPhone && isDesktopDevice()
    const isDeviceActive = isDeviceReady(device)
    const { permissionDenied } = useMicrophonePermissions()
    const isButtonDisabled = !isDeviceActive || permissionDenied

    useConditionalShortcuts(
        shouldDisplayButton && isDeviceActive && !permissionDenied,
        'Dialpad',
        {
            OPEN_DIALPAD: {
                action: (e) => {
                    e.preventDefault()
                    setIsDeviceVisible(true)
                },
            },
        },
    )

    useEffect(() => {
        if (!device) {
            setIsDeviceVisible(false)
        }
    }, [device])

    return {
        isDeviceVisible,
        setIsDeviceVisible,
        shouldDisplayButton,
        isDeviceActive,
        isButtonDisabled,
    }
}
