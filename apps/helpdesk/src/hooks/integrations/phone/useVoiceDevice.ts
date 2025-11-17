import { useContext } from 'react'

import type { VoiceDeviceContextState } from 'pages/integrations/integration/components/voice/VoiceDeviceContext'
import { Context } from 'pages/integrations/integration/components/voice/VoiceDeviceContext'

export default function useVoiceDevice(): VoiceDeviceContextState {
    const context = useContext(Context)

    if (context === null) {
        throw new Error(
            'useVoiceDevice must be used within a VoiceDeviceProvider',
        )
    }

    return context
}
