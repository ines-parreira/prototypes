import { createContext } from 'react'

import { VoiceQueue } from '@gorgias/api-queries'

type VoiceQueueContextType = {
    getQueueFromId: (id: number) => VoiceQueue | null | undefined
}

export const VoiceQueueContext = createContext<VoiceQueueContextType | null>(
    null,
)
