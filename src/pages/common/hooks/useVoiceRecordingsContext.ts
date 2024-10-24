import {useContext} from 'react'

import {VoiceRecordingsContext} from 'pages/integrations/integration/components/voice/VoiceRecordingsContext'

export const useVoiceRecordingsContext = () => {
    const context = useContext(VoiceRecordingsContext)
    if (!context) {
        throw new Error(
            'useVoiceRecordingsContext must be used within a VoiceRecordingsProvider'
        )
    }

    return context
}
