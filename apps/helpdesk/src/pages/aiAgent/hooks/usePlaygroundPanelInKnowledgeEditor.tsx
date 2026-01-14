import { useCallback, useMemo, useState } from 'react'

import type { SizeValue } from '@gorgias/axiom'

import useScreenSize from 'panels/hooks/useScreenSize'

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
    const [windowWidth] = useScreenSize()

    const onTest = useCallback(() => {
        setIsPlaygroundOpen((prev) => !prev)
    }, [])

    const onClosePlayground = useCallback(() => {
        setIsPlaygroundOpen(false)
    }, [])

    const sidePanelWidth = useMemo((): SizeValue => {
        // When playground is open, always use 98vw
        if (isPlaygroundOpen) {
            return '98vw'
        }

        // When user manually enables fullscreen, use 100vw
        if (isFullscreen) {
            return '100vw'
        }

        // When viewport < 918px, auto-enable fullscreen
        if (windowWidth < 918) {
            return '100vw'
        }

        // Otherwise, use responsive width with 920px minimum
        // This maintains 66vw on larger screens, but never goes below 920px.
        // By default, side panel width gets "- calc(var(--spacing-xs) * 2))" we need to remove that to maintain proper size
        return 'calc(calc(max(920px, 66vw)) + calc(var(--spacing-xs) * 2))'
    }, [isFullscreen, isPlaygroundOpen, windowWidth])

    return {
        isPlaygroundOpen,
        onTest,
        onClosePlayground,
        sidePanelWidth,
    }
}
