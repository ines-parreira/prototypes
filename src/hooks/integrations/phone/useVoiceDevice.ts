import {useContext} from 'react'

import {
    Context,
    VoiceDeviceContextState,
} from 'pages/integrations/integration/components/voice/VoiceDeviceContext'

export default function useVoiceDevice(): VoiceDeviceContextState {
    return useContext(Context)
}
