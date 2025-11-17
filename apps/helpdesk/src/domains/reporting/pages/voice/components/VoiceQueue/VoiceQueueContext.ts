import { createContext } from 'react'

import type { VoiceQueue } from '@gorgias/helpdesk-queries'

type VoiceQueueContextType = {
    getQueueFromId: (id: number) => VoiceQueue | null | undefined
}

export const VoiceQueueContext = createContext<VoiceQueueContextType | null>(
    null,
)
