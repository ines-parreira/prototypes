import {useEffect} from 'react'

import usePanels from './usePanels'

export default function usePanelGroup(subtractedSize?: number) {
    const {subtractSize} = usePanels()

    useEffect(() => {
        if (!subtractedSize) return
        return subtractSize(subtractedSize)
    }, [subtractSize, subtractedSize])
}
