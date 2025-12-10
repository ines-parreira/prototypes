import { useEffect, useState } from 'react'

import type { DraftKnowledge } from '../types'

const KNOWLEDGE_LOADING_MOCK_TIME = 5000

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
        }, KNOWLEDGE_LOADING_MOCK_TIME)

        return () => clearTimeout(timer)
    }, [draftKnowledge])

    return { isDraftKnowledgeReady: knowledgeReady }
}
