import { useEffect, useState } from 'react'
import { Duration } from '@gorgias/toolkit'

import type { DraftKnowledge } from '../types'

export const useDraftKnowledgeSync = (draftKnowledge?: DraftKnowledge) => {
    const [knowledgeReady, setKnowledgeReady] = useState(false)

    useEffect(() => {
        if (!draftKnowledge) {
            setKnowledgeReady(true)
            return
        }

        setKnowledgeReady(false)
        const timer = setTimeout(() => {
            setKnowledgeReady(true)
            // Simulate knowledge loading delay, as we don't
            // have real API for this yet
        }, Duration.seconds(5))

        return () => clearTimeout(timer)
    }, [draftKnowledge])

    return { isDraftKnowledgeReady: knowledgeReady }
}
