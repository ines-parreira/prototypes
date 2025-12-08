import { useCallback, useMemo, useState } from 'react'

import type { SizeValue } from '@gorgias/axiom'

/**
 * Custom hook that manages the playground panel state for Knowledge Editor components.
 * This hook encapsulates the logic for opening/closing the playground panel and
 * calculating the side panel width based on the fullscreen and playground state.
 *
 * @param isFullscreen - boolean indicating if the editor is in fullscreen mode
 * @returns An object containing:
 * - isPlaygroundOpen: boolean indicating if the playground panel is open
 * - onTest: callback to toggle the playground panel
 * - onClosePlayground: callback to close the playground panel
 * - sidePanelWidth: calculated width for the side panel based on current state
 */
export const usePlaygroundPanelInKnowledgeEditor = (isFullscreen: boolean) => {
    const [isPlaygroundOpen, setIsPlaygroundOpen] = useState(false)

    const onTest = useCallback(() => {
        setIsPlaygroundOpen((prev) => !prev)
    }, [])

    const onClosePlayground = useCallback(() => {
        setIsPlaygroundOpen(false)
    }, [])

    const sidePanelWidth = useMemo((): SizeValue => {
        let width: SizeValue = '66vw'
        if (isFullscreen) {
            width = '100vw'
        }
        if (isPlaygroundOpen) {
            width = '98vw'
        }
        return width
    }, [isFullscreen, isPlaygroundOpen])

    return {
        isPlaygroundOpen,
        onTest,
        onClosePlayground,
        sidePanelWidth,
    }
}
