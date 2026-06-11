import { useEffect, useState } from 'react'
import { Duration } from '@gorgias/toolkit'

import type { HighlightedElements } from 'pages/tickets/detail/components/AuditLogEvent'

export function useHighlightedElements() {
    const state = useState<HighlightedElements | null>(null)
    const [elements, setElements] = state

    useEffect(() => {
        if (!elements) return

        const timeoutId = setTimeout(() => {
            setElements(null)
        }, Duration.seconds(1))

        return () => {
            clearTimeout(timeoutId)
        }
    }, [elements, setElements])

    return state
}
