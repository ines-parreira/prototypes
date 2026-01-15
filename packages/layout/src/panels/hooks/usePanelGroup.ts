import { useEffect } from 'react'

import { usePanels } from './usePanels'

export function usePanelGroup(subtractedSize?: number) {
    const { subtractSize } = usePanels()

    useEffect(() => {
        if (!subtractedSize) return
        return subtractSize(subtractedSize)
    }, [subtractSize, subtractedSize])
}
