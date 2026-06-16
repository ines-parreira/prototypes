import { FeatureFlagKey, fetchFlag } from '@repo/feature-flags'
import { logEvent, SegmentEvent } from '@repo/logging'
import { assumeMock } from '@repo/testing'

import { enableDraggableGaiaButton, initGaia } from '../gaia'

jest.mock('@repo/feature-flags')
jest.mock('@repo/logging')

const fetchFlagMock = assumeMock(fetchFlag)
const logEventMock = assumeMock(logEvent)

const GAIA_SCRIPT_SELECTOR =
    'script[src="https://gaia.gorgias-decision-engine.com/embed.js"]'
const GAIA_BUTTON_POSITION_KEY = 'gaia-embed-button-position'

// jsdom defaults: window.innerWidth=1024, window.innerHeight=768
// Button size fallback: 60x60
// Default position: x = 1024-60-30 = 934, y = 768-60-100 = 608
// Stored as: { rightOffset: 1024-60-934 = 30, bottomOffset: 768-60-608 = 100 }
const DEFAULT_STORED = { rightOffset: 30, bottomOffset: 100 }
const DEFAULT_LEFT = '934px'
const DEFAULT_TOP = '608px'

const createGaiaButton = () => {
    const button = document.createElement('button')
    button.id = 'gaia-embed-btn'
    document.body.appendChild(button)
    return button
}

const dispatchPointerEvent = (
    target: EventTarget,
    type: string,
    overrides: Partial<{
        button: number
        pointerId: number
        clientX: number
        clientY: number
    }> = {},
) => {
    const event = new Event(type, {
        bubbles: true,
        cancelable: true,
    }) as Event

    Object.defineProperties(event, {
        button: { value: overrides.button ?? 0 },
        pointerId: { value: overrides.pointerId ?? 1 },
        clientX: { value: overrides.clientX ?? 0 },
        clientY: { value: overrides.clientY ?? 0 },
    })

    target.dispatchEvent(event)
}

describe('initGaia()', () => {
    let cleanupGaiaButtonEnhancer: (() => void) | void

    afterEach(() => {
        cleanupGaiaButtonEnhancer?.()
        cleanupGaiaButtonEnhancer = undefined
        jest.clearAllMocks()
        jest.useRealTimers()
        window.USER_IMPERSONATED = null
        localStorage.removeItem(GAIA_BUTTON_POSITION_KEY)
        document.body.innerHTML = ''
        document.head
            .querySelectorAll(GAIA_SCRIPT_SELECTOR)
            .forEach((el) => el.remove())
    })

    it('appends the embed script and logs the segment event when the flag is true', async () => {
        fetchFlagMock.mockResolvedValueOnce({ flag: true, error: null }) // GaiaEmbed
        fetchFlagMock.mockResolvedValueOnce({ flag: true, error: null }) // KnowledgeIntentManagementSystem

        cleanupGaiaButtonEnhancer = await initGaia()

        expect(fetchFlagMock).toHaveBeenCalledWith(
            FeatureFlagKey.GaiaEmbed,
            false,
        )

        const script =
            document.head.querySelector<HTMLScriptElement>(GAIA_SCRIPT_SELECTOR)
        expect(script).not.toBeNull()
        expect(script?.async).toBe(true)

        expect(logEventMock).toHaveBeenCalledTimes(1)
        expect(logEventMock).toHaveBeenCalledWith(SegmentEvent.GaiaEmbedLoaded)
    })

    it('appends the embed script and logs the segment event when the session is impersonated and the flag is false', async () => {
        window.USER_IMPERSONATED = true
        fetchFlagMock.mockResolvedValueOnce({ flag: false, error: null })

        cleanupGaiaButtonEnhancer = await initGaia()

        const script =
            document.head.querySelector<HTMLScriptElement>(GAIA_SCRIPT_SELECTOR)
        expect(script).not.toBeNull()
        expect(script?.async).toBe(true)

        expect(logEventMock).toHaveBeenCalledTimes(1)
        expect(logEventMock).toHaveBeenCalledWith(SegmentEvent.GaiaEmbedLoaded)
    })

    it('does not append the script when Skills access is disabled even if the GaiaEmbed flag is true', async () => {
        window.USER_IMPERSONATED = null
        fetchFlagMock.mockResolvedValueOnce({ flag: true, error: null }) // GaiaEmbed
        fetchFlagMock.mockResolvedValueOnce({ flag: false, error: null }) // KnowledgeIntentManagementSystem

        cleanupGaiaButtonEnhancer = await initGaia()

        expect(document.head.querySelector(GAIA_SCRIPT_SELECTOR)).toBeNull()
        expect(logEventMock).not.toHaveBeenCalled()
    })

    it('appends the script when impersonated even if Skills access is disabled', async () => {
        window.USER_IMPERSONATED = true
        fetchFlagMock.mockResolvedValueOnce({ flag: true, error: null }) // GaiaEmbed
        // No second mock needed — impersonated sessions skip the KnowledgeIntentManagementSystem check

        cleanupGaiaButtonEnhancer = await initGaia()

        const script =
            document.head.querySelector<HTMLScriptElement>(GAIA_SCRIPT_SELECTOR)
        expect(script).not.toBeNull()
        expect(script?.async).toBe(true)
        expect(logEventMock).toHaveBeenCalledWith(SegmentEvent.GaiaEmbedLoaded)
    })

    it('does nothing when the flag is false and the session is not impersonated', async () => {
        window.USER_IMPERSONATED = null
        fetchFlagMock.mockResolvedValueOnce({ flag: false, error: null })

        cleanupGaiaButtonEnhancer = await initGaia()

        expect(document.head.querySelector(GAIA_SCRIPT_SELECTOR)).toBeNull()
        expect(logEventMock).not.toHaveBeenCalled()
    })

    it('does nothing when fetchFlag fails (fail-closed)', async () => {
        window.USER_IMPERSONATED = null
        fetchFlagMock.mockResolvedValueOnce({
            flag: false,
            error: new Error('SDK init failed'),
        })

        cleanupGaiaButtonEnhancer = await initGaia()

        expect(document.head.querySelector(GAIA_SCRIPT_SELECTOR)).toBeNull()
        expect(logEventMock).not.toHaveBeenCalled()
    })
})

describe('enableDraggableGaiaButton()', () => {
    let cleanupGaiaButtonEnhancer: (() => void) | undefined

    afterEach(() => {
        cleanupGaiaButtonEnhancer?.()
        cleanupGaiaButtonEnhancer = undefined
        jest.useRealTimers()
        localStorage.removeItem(GAIA_BUTTON_POSITION_KEY)
        document.body.innerHTML = ''
    })

    it('positions the Gaia button at bottom-right by default when no position is saved', async () => {
        cleanupGaiaButtonEnhancer = enableDraggableGaiaButton()

        const button = createGaiaButton()
        await Promise.resolve()
        await Promise.resolve()

        expect(button.style.left).toBe(DEFAULT_LEFT)
        expect(button.style.top).toBe(DEFAULT_TOP)
    })

    it('restores to the default bottom-right position when the default stored offsets are loaded', async () => {
        localStorage.setItem(
            GAIA_BUTTON_POSITION_KEY,
            JSON.stringify(DEFAULT_STORED),
        )

        cleanupGaiaButtonEnhancer = enableDraggableGaiaButton()

        const button = createGaiaButton()
        await Promise.resolve()
        await Promise.resolve()

        expect(button.style.left).toBe(DEFAULT_LEFT)
        expect(button.style.top).toBe(DEFAULT_TOP)
    })

    it('restores a saved position (relative offsets) when the button is inserted after initialization', async () => {
        // Save position 50px from right, 80px from bottom
        // → x = 1024 - 60 - 50 = 914, y = 768 - 60 - 80 = 628
        localStorage.setItem(
            GAIA_BUTTON_POSITION_KEY,
            JSON.stringify({ rightOffset: 50, bottomOffset: 80 }),
        )

        cleanupGaiaButtonEnhancer = enableDraggableGaiaButton()

        const button = createGaiaButton()
        await Promise.resolve()
        await Promise.resolve()

        expect(button.style.left).toBe('914px')
        expect(button.style.top).toBe('628px')
        expect(button.style.right).toBe('')
        expect(button.style.bottom).toBe('')
        expect(button.getAttribute('data-react-aria-top-layer')).toBe('true')
    })

    it('clamps a restored position that falls outside the viewport', async () => {
        // Very large offsets → button would be off-screen → clamped to edge margin
        localStorage.setItem(
            GAIA_BUTTON_POSITION_KEY,
            JSON.stringify({ rightOffset: -9999, bottomOffset: -9999 }),
        )

        cleanupGaiaButtonEnhancer = enableDraggableGaiaButton()

        const button = createGaiaButton()
        await Promise.resolve()
        await Promise.resolve()

        // maxX = 1024 - 60 - 16 = 948, maxY = 768 - 60 - 16 = 692
        expect(button.style.left).toBe('948px')
        expect(button.style.top).toBe('692px')
    })

    it('snaps to viewport boundary on drag release and stays there after a DOM mutation', async () => {
        const button = createGaiaButton()
        cleanupGaiaButtonEnhancer = enableDraggableGaiaButton()

        // Drag to a position outside maxX (1024-60-16=948) — e.g. x=960
        dispatchPointerEvent(button, 'pointerdown', {
            clientX: 900,
            clientY: 600,
        })
        dispatchPointerEvent(button, 'pointermove', {
            clientX: 926,
            clientY: 600,
        }) // 934+26 = 960, outside maxX
        dispatchPointerEvent(button, 'pointerup', {
            clientX: 926,
            clientY: 600,
        })

        // Clamped to maxX=948 immediately on release
        expect(button.style.left).toBe('948px')

        // DOM mutation after drop (e.g. tooltip, re-render) — no further movement
        document.body.appendChild(document.createElement('div'))
        await Promise.resolve()
        await Promise.resolve()

        expect(button.style.left).toBe('948px')
    })

    it('does not snap the button back when a DOM mutation fires during a drag', async () => {
        const button = createGaiaButton()
        cleanupGaiaButtonEnhancer = enableDraggableGaiaButton()

        dispatchPointerEvent(button, 'pointerdown', {
            clientX: 900,
            clientY: 600,
        })
        dispatchPointerEvent(button, 'pointermove', {
            clientX: 860,
            clientY: 560,
        })

        const positionDuringDrag = button.style.left

        // Simulate a DOM mutation (e.g. tooltip) while the drag is active
        document.body.appendChild(document.createElement('div'))
        await Promise.resolve()
        await Promise.resolve()

        expect(button.style.left).toBe(positionDuringDrag)

        dispatchPointerEvent(button, 'pointerup', {
            clientX: 860,
            clientY: 560,
        })
    })

    it('persists the dragged position as relative offsets and suppresses the drag-ending click', () => {
        jest.useFakeTimers()

        const button = createGaiaButton()
        cleanupGaiaButtonEnhancer = enableDraggableGaiaButton()

        const clickSpy = jest.fn()
        button.addEventListener('click', clickSpy)

        // Starts from default: x=934, y=608. Drag -20,-20 → x=914, y=588.
        dispatchPointerEvent(button, 'pointerdown', {
            clientX: 900,
            clientY: 600,
        })
        dispatchPointerEvent(button, 'pointermove', {
            clientX: 880,
            clientY: 580,
        })
        dispatchPointerEvent(button, 'pointerup', {
            clientX: 880,
            clientY: 580,
        })

        button.click()

        expect(clickSpy).not.toHaveBeenCalled()
        expect(button.style.left).toBe('914px')
        expect(button.style.top).toBe('588px')
        // Stored as relative: rightOffset = 1024-60-914 = 50, bottomOffset = 768-60-588 = 120
        expect(localStorage.getItem(GAIA_BUTTON_POSITION_KEY)).toBe(
            JSON.stringify({ rightOffset: 50, bottomOffset: 120 }),
        )

        jest.runAllTimers()
        button.click()

        expect(clickSpy).toHaveBeenCalledTimes(1)
    })
})
