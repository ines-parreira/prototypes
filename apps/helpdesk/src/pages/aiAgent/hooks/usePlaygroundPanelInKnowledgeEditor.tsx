import { useCallback, useMemo, useState } from 'react'

import type { SizeValue } from '@gorgias/axiom'

import useScreenSize from 'panels/hooks/useScreenSize'

/**
 * Threshold width below which the fullscreen button should be hidden when playground is open
 */
const FULLSCREEN_BUTTON_HIDE_THRESHOLD = 1400

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
 * - shouldHideFullscreenButton: boolean indicating if fullscreen button should be hidden
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

    /**
     * Determines if the fullscreen button should be hidden.
     * Button hides when screen width is below threshold AND playground is open.
     */
    const shouldHideFullscreenButton = useMemo(
        () =>
            windowWidth < FULLSCREEN_BUTTON_HIDE_THRESHOLD && isPlaygroundOpen,
        [windowWidth, isPlaygroundOpen],
    )

    /**
     * Computes the effective fullscreen state.
     * When button should be hidden, force fullscreen mode.
     * Otherwise, use the actual fullscreen state from the component.
     */
    const effectiveIsFullscreen = useMemo(
        () => (shouldHideFullscreenButton ? true : isFullscreen),
        [shouldHideFullscreenButton, isFullscreen],
    )

    const sidePanelWidth = useMemo((): SizeValue => {
        if (effectiveIsFullscreen) {
            return '100vw'
        }

        // When viewport < 918px, base width is 100vw
        if (windowWidth < 918) {
            return '100vw'
        }

        const baseWidth =
            'calc(calc(max(920px, 66vw)) + calc(var(--spacing-xs) * 2))'

        if (isPlaygroundOpen) {
            return `calc(min(calc(${baseWidth} + 480px + var(--layout-spacing-xs)), 98vw)`
        }

        return baseWidth
    }, [effectiveIsFullscreen, isPlaygroundOpen, windowWidth])

    return {
        isPlaygroundOpen,
        onTest,
        onClosePlayground,
        sidePanelWidth,
        shouldHideFullscreenButton,
    }
}
