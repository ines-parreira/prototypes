import { FeatureFlagKey, fetchFlag } from '@repo/feature-flags'
import { logEvent, SegmentEvent } from '@repo/logging'

const GAIA_EMBED_SCRIPT_SRC =
    'https://gaia.gorgias-decision-engine.com/embed.js'
const GAIA_BUTTON_ID = 'gaia-embed-btn'
const GAIA_BUTTON_DEFAULT_SIZE = 60
const GAIA_BUTTON_DEFAULT_RIGHT = 30
const GAIA_BUTTON_DEFAULT_BOTTOM = 100
const GAIA_BUTTON_EDGE_MARGIN = 16
const GAIA_BUTTON_DRAG_THRESHOLD = 6
const GAIA_BUTTON_POSITION_KEY = 'gaia-embed-button-position'
const GAIA_BUTTON_ENHANCED_ATTR = 'data-gaia-draggable'

type ButtonPosition = {
    x: number
    y: number
}

let cleanupGaiaButtonEnhancer: (() => void) | null = null

export async function initGaia() {
    const { flag: isFlagEnabled } = await fetchFlag(
        FeatureFlagKey.GaiaEmbed,
        false,
    )
    const isEnabled = isFlagEnabled || !!window.USER_IMPERSONATED

    if (!isEnabled) return

    const cleanup = enableDraggableGaiaButton()

    const script = document.createElement('script')
    script.src = GAIA_EMBED_SCRIPT_SRC
    script.async = true
    document.head.appendChild(script)

    logEvent(SegmentEvent.GaiaEmbedLoaded)

    return cleanup
}

export function enableDraggableGaiaButton() {
    if (cleanupGaiaButtonEnhancer) return cleanupGaiaButtonEnhancer

    if (!document.body) {
        cleanupGaiaButtonEnhancer = () => {
            cleanupGaiaButtonEnhancer = null
        }
        return cleanupGaiaButtonEnhancer
    }

    let activeButton: HTMLButtonElement | null = null
    let buttonPosition = loadGaiaButtonPosition()

    const applyPosition = (
        button: HTMLButtonElement,
        position = buttonPosition,
    ) => {
        buttonPosition = clampGaiaButtonPosition(position, button)
        button.style.left = `${buttonPosition.x}px`
        button.style.top = `${buttonPosition.y}px`
        button.style.right = 'auto'
        button.style.bottom = 'auto'
        button.style.cursor = 'grab'
        button.setAttribute('data-react-aria-top-layer', 'true')
    }

    const savePosition = (position = buttonPosition) => {
        buttonPosition = clampGaiaButtonPosition(position, activeButton)
        try {
            localStorage.setItem(
                GAIA_BUTTON_POSITION_KEY,
                JSON.stringify(buttonPosition),
            )
        } catch {
            // Ignore storage failures.
        }
        return buttonPosition
    }

    const enhanceButton = (button: HTMLButtonElement) => {
        activeButton = button
        applyPosition(button)

        button.style.touchAction = 'none'
        button.style.userSelect = 'none'
        button.style.setProperty('-webkit-user-select', 'none')

        if (button.getAttribute(GAIA_BUTTON_ENHANCED_ATTR) === 'true') {
            return
        }

        button.setAttribute(GAIA_BUTTON_ENHANCED_ATTR, 'true')

        let pointerId: number | null = null
        let isDragging = false
        let suppressClick = false
        let suppressClickResetId: number | null = null
        let startX = 0
        let startY = 0
        let startButtonX = 0
        let startButtonY = 0

        const clearClickReset = () => {
            if (suppressClickResetId === null) return
            window.clearTimeout(suppressClickResetId)
            suppressClickResetId = null
        }

        const applyRestingCursor = () => {
            button.style.cursor = isDragging ? 'grabbing' : 'grab'
        }

        const handlePointerDown = (event: PointerEvent) => {
            if (typeof event.button === 'number' && event.button !== 0) return

            clearClickReset()
            isDragging = false
            suppressClick = false
            pointerId = event.pointerId
            startX = event.clientX
            startY = event.clientY

            const position = clampGaiaButtonPosition(buttonPosition, button)
            startButtonX = position.x
            startButtonY = position.y

            try {
                button.setPointerCapture?.(pointerId)
            } catch {
                // Ignore browsers/environments without pointer capture.
            }

            button.style.cursor = 'grabbing'
        }

        const handlePointerMove = (event: PointerEvent) => {
            if (pointerId === null || event.pointerId !== pointerId) return

            const deltaX = event.clientX - startX
            const deltaY = event.clientY - startY

            if (!isDragging) {
                if (
                    Math.abs(deltaX) < GAIA_BUTTON_DRAG_THRESHOLD &&
                    Math.abs(deltaY) < GAIA_BUTTON_DRAG_THRESHOLD
                ) {
                    return
                }

                isDragging = true
                suppressClick = true
            }

            event.preventDefault()
            applyPosition(button, {
                x: startButtonX + deltaX,
                y: startButtonY + deltaY,
            })
        }

        const endPointerInteraction = (event?: PointerEvent) => {
            if (
                pointerId === null ||
                (event != null && event.pointerId !== pointerId)
            ) {
                return
            }

            if (pointerId !== null) {
                try {
                    button.releasePointerCapture?.(pointerId)
                } catch {
                    // Ignore browsers/environments without pointer capture.
                }
            }

            pointerId = null

            if (isDragging) {
                savePosition(buttonPosition)
            }

            isDragging = false
            applyRestingCursor()
            clearClickReset()
            suppressClickResetId = window.setTimeout(() => {
                suppressClick = false
                suppressClickResetId = null
            }, 0)
        }

        const handleClickCapture = (event: MouseEvent) => {
            if (!suppressClick) return

            event.preventDefault()
            event.stopPropagation()
            event.stopImmediatePropagation()
            suppressClick = false
            clearClickReset()
        }

        button.addEventListener('pointerdown', handlePointerDown)
        button.addEventListener('pointermove', handlePointerMove)
        button.addEventListener('pointerup', endPointerInteraction)
        button.addEventListener('pointercancel', endPointerInteraction)
        button.addEventListener('click', handleClickCapture, true)
    }

    const syncActiveButton = () => {
        const button = findGaiaButton()
        if (!button) return

        enhanceButton(button)
    }

    const handleResize = () => {
        syncActiveButton()
        if (!activeButton) return

        buttonPosition = clampGaiaButtonPosition(buttonPosition, activeButton)
        applyPosition(activeButton, buttonPosition)
        savePosition(buttonPosition)
    }

    const observer = new MutationObserver(syncActiveButton)
    observer.observe(document.body, { childList: true, subtree: true })
    window.addEventListener('resize', handleResize)

    syncActiveButton()

    cleanupGaiaButtonEnhancer = () => {
        observer.disconnect()
        window.removeEventListener('resize', handleResize)
        cleanupGaiaButtonEnhancer = null
    }

    return cleanupGaiaButtonEnhancer
}

function findGaiaButton() {
    const button = document.getElementById(GAIA_BUTTON_ID)
    return button instanceof HTMLButtonElement ? button : null
}

function loadGaiaButtonPosition() {
    try {
        const rawPosition = localStorage.getItem(GAIA_BUTTON_POSITION_KEY)
        if (!rawPosition) return clampGaiaButtonPosition(null)

        return clampGaiaButtonPosition(JSON.parse(rawPosition))
    } catch {
        return clampGaiaButtonPosition(null)
    }
}

function clampGaiaButtonPosition(
    position: ButtonPosition | null | undefined,
    button?: HTMLButtonElement | null,
) {
    const defaultPosition = getDefaultGaiaButtonPosition(button)
    const buttonSize = getGaiaButtonSize(button)
    const maxX = Math.max(
        GAIA_BUTTON_EDGE_MARGIN,
        window.innerWidth - buttonSize.width - GAIA_BUTTON_EDGE_MARGIN,
    )
    const maxY = Math.max(
        GAIA_BUTTON_EDGE_MARGIN,
        window.innerHeight - buttonSize.height - GAIA_BUTTON_EDGE_MARGIN,
    )

    let x = position?.x ?? defaultPosition.x
    let y = position?.y ?? defaultPosition.y

    x = Math.min(Math.max(x, GAIA_BUTTON_EDGE_MARGIN), maxX)
    y = Math.min(Math.max(y, GAIA_BUTTON_EDGE_MARGIN), maxY)

    return {
        x: Math.round(x),
        y: Math.round(y),
    }
}

function getDefaultGaiaButtonPosition(button?: HTMLButtonElement | null) {
    const buttonSize = getGaiaButtonSize(button)

    return {
        x: Math.max(
            GAIA_BUTTON_EDGE_MARGIN,
            window.innerWidth - buttonSize.width - GAIA_BUTTON_DEFAULT_RIGHT,
        ),
        y: Math.max(
            GAIA_BUTTON_EDGE_MARGIN,
            window.innerHeight - buttonSize.height - GAIA_BUTTON_DEFAULT_BOTTOM,
        ),
    }
}

function getGaiaButtonSize(button?: HTMLButtonElement | null) {
    if (!button) {
        return {
            width: GAIA_BUTTON_DEFAULT_SIZE,
            height: GAIA_BUTTON_DEFAULT_SIZE,
        }
    }

    const { width, height } = button.getBoundingClientRect()

    return {
        width: width || button.offsetWidth || GAIA_BUTTON_DEFAULT_SIZE,
        height: height || button.offsetHeight || GAIA_BUTTON_DEFAULT_SIZE,
    }
}
