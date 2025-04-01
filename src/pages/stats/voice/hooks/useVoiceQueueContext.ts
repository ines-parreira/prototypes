import { useContext } from 'react'

import { VoiceQueueContext } from '../components/VoiceQueue/VoiceQueueContext'

export const useVoiceQueueContext = () => {
    const context = useContext(VoiceQueueContext)
    if (context === undefined || context === null) {
        throw new Error(
            'useVoiceQueueContext must be used within a VoiceQueueProvider',
        )
    }
    return context
}
