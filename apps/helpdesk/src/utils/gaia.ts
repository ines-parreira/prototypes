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

// Absolute pixel position used internally during the session.
type ButtonPosition = {
    x: number
    y: number
}

// What gets persisted to localStorage — relative to the screen edges so the
// button restores to the same visual corner regardless of screen size.
type StoredPosition = {
    rightOffset: number
    bottomOffset: number
}

let cleanupGaiaButtonEnhancer: (() => void) | null = null

export async function initGaia() {
    const { flag: isFlagEnabled } = await fetchFlag(
        FeatureFlagKey.GaiaEmbed,
        false,
    )
    const isImpersonated = !!window.USER_IMPERSONATED
    const isEnabled = isFlagEnabled || isImpersonated

    if (!isEnabled) return

    // During impersonation, always allow the Skills popup (COACH-2685 rule).
    // For normal merchant sessions, also require the Skills feature flag.
    if (!isImpersonated) {
        const { flag: skillsFlag } = await fetchFlag(
            FeatureFlagKey.KnowledgeIntentManagementSystem,
            false,
        )
        if (skillsFlag !== true) return
    }

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
    let buttonPosition: ButtonPosition | null = null
    let storedPosition: StoredPosition | null = loadGaiaButtonPosition()
    let isDragging = false
    let lastApplied = { left: '', top: '', right: '', bottom: '' }
    let buttonStyleObserver: MutationObserver | null = null

    const applyPosition = (
        button: HTMLButtonElement,
        position: ButtonPosition | null = buttonPosition,
    ) => {
        buttonPosition = clampGaiaButtonPosition(position, button)
        button.style.left = `${buttonPosition.x}px`
        button.style.top = `${buttonPosition.y}px`
        button.style.right = 'auto'
        button.style.bottom = 'auto'
        button.style.cursor = 'grab'
        button.setAttribute('data-react-aria-top-layer', 'true')
        lastApplied = {
            left: button.style.left,
            top: button.style.top,
            right: button.style.right,
            bottom: button.style.bottom,
        }
    }

    const savePosition = () => {
        if (!buttonPosition || !activeButton) return
        const { width, height } = getGaiaButtonSize(activeButton)
        storedPosition = {
            rightOffset: Math.round(
                window.innerWidth - width - buttonPosition.x,
            ),
            bottomOffset: Math.round(
                window.innerHeight - height - buttonPosition.y,
            ),
        }
        try {
            localStorage.setItem(
                GAIA_BUTTON_POSITION_KEY,
                JSON.stringify(storedPosition),
            )
        } catch {
            // Ignore storage failures.
        }
    }

    const storedToAbsolute = (
        stored: StoredPosition,
        button: HTMLButtonElement | null,
    ): ButtonPosition => {
        const { width, height } = getGaiaButtonSize(button)
        return {
            x: window.innerWidth - width - stored.rightOffset,
            y: window.innerHeight - height - stored.bottomOffset,
        }
    }

    const enhanceButton = (button: HTMLButtonElement) => {
        activeButton = button

        // On first enhancement, convert the stored relative position to absolute
        // using the current button size and viewport dimensions.
        if (storedPosition !== null && buttonPosition === null) {
            buttonPosition = storedToAbsolute(storedPosition, button)
        }

        if (!isDragging) {
            // Skip re-applying if the button is already at our expected position.
            // This prevents the body MutationObserver (which fires on any DOM
            // change) from clamping a freely-dropped position after a drag.
            const isAtExpectedPosition =
                buttonPosition !== null &&
                button.style.left === `${buttonPosition.x}px` &&
                button.style.top === `${buttonPosition.y}px`

            if (!isAtExpectedPosition) {
                applyPosition(button)
            }
        }

        button.style.touchAction = 'none'
        button.style.userSelect = 'none'
        button.style.setProperty('-webkit-user-select', 'none')

        if (button.getAttribute(GAIA_BUTTON_ENHANCED_ATTR) === 'true') {
            return
        }

        button.setAttribute(GAIA_BUTTON_ENHANCED_ATTR, 'true')

        // Watch for embed.js overriding our position styles and immediately
        // restore our position when it does.
        buttonStyleObserver?.disconnect()
        buttonStyleObserver = new MutationObserver(() => {
            if (isDragging) return
            if (
                button.style.left === lastApplied.left &&
                button.style.top === lastApplied.top &&
                button.style.right === lastApplied.right &&
                button.style.bottom === lastApplied.bottom
            )
                return
            applyPosition(button)
        })
        buttonStyleObserver.observe(button, {
            attributes: true,
            attributeFilter: ['style'],
        })

        let pointerId: number | null = null
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

            // Read the actual rendered position so the drag starts from where
            // the button visually is, not a stale stored value.
            const parsedLeft = parseFloat(button.style.left)
            const parsedTop = parseFloat(button.style.top)
            const rect = button.getBoundingClientRect()
            startButtonX = Number.isFinite(parsedLeft) ? parsedLeft : rect.left
            startButtonY = Number.isFinite(parsedTop) ? parsedTop : rect.top

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

            // Apply without clamping during drag so the button follows the
            // pointer freely. Clamping to viewport bounds happens on release.
            const x = Math.round(startButtonX + deltaX)
            const y = Math.round(startButtonY + deltaY)
            buttonPosition = { x, y }
            button.style.left = `${x}px`
            button.style.top = `${y}px`
            lastApplied = {
                left: button.style.left,
                top: button.style.top,
                right: button.style.right,
                bottom: button.style.bottom,
            }
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
                applyPosition(button)
                savePosition()
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
        if (!activeButton || isDragging) return

        // Re-derive absolute position from the stored relative offsets so the
        // button stays at the same corner on the resized viewport.
        if (storedPosition !== null) {
            buttonPosition = storedToAbsolute(storedPosition, activeButton)
        } else {
            buttonPosition = null // re-compute default bottom-right for new size
        }

        applyPosition(activeButton)
    }

    const observer = new MutationObserver(syncActiveButton)
    observer.observe(document.body, { childList: true, subtree: true })
    window.addEventListener('resize', handleResize)

    syncActiveButton()

    cleanupGaiaButtonEnhancer = () => {
        observer.disconnect()
        buttonStyleObserver?.disconnect()
        window.removeEventListener('resize', handleResize)
        cleanupGaiaButtonEnhancer = null
    }

    return cleanupGaiaButtonEnhancer
}

function findGaiaButton() {
    const button = document.getElementById(GAIA_BUTTON_ID)
    return button instanceof HTMLButtonElement ? button : null
}

function loadGaiaButtonPosition(): StoredPosition | null {
    try {
        const raw = localStorage.getItem(GAIA_BUTTON_POSITION_KEY)
        if (!raw) return null

        const parsed = JSON.parse(raw)
        if (
            parsed == null ||
            typeof parsed.rightOffset !== 'number' ||
            typeof parsed.bottomOffset !== 'number'
        ) {
            return null
        }

        return parsed as StoredPosition
    } catch {
        return null
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
