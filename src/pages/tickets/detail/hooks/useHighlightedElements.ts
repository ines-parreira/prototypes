import { useEffect, useState } from 'react'

import { HighlightedElements } from 'pages/tickets/detail/components/AuditLogEvent'

export default function useHighlightedElements() {
    const state = useState<HighlightedElements | null>(null)
    const [elements, setElements] = state

    useEffect(() => {
        if (!elements) return

        const timeoutId = setTimeout(() => {
            setElements(null)
        }, 1000)

        return () => {
            clearTimeout(timeoutId)
        }
    }, [elements, setElements])

    return state
}
