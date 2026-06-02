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
        fetchFlagMock.mockResolvedValueOnce({ flag: true, error: null })

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

    it('restores the saved Gaia button position when the button is inserted after initialization', async () => {
        localStorage.setItem(
            GAIA_BUTTON_POSITION_KEY,
            JSON.stringify({ x: 9999, y: 9999 }),
        )

        cleanupGaiaButtonEnhancer = enableDraggableGaiaButton()

        const button = createGaiaButton()
        await Promise.resolve()
        await Promise.resolve()

        expect(button.style.left).toBe('948px')
        expect(button.style.top).toBe('692px')
        expect(button.style.right).toBe('')
        expect(button.style.bottom).toBe('')
        expect(button.getAttribute('data-react-aria-top-layer')).toBe('true')
    })

    it('persists the dragged Gaia button position and suppresses the drag-ending click', () => {
        jest.useFakeTimers()

        const button = createGaiaButton()
        cleanupGaiaButtonEnhancer = enableDraggableGaiaButton()

        const clickSpy = jest.fn()
        button.addEventListener('click', clickSpy)

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
        expect(localStorage.getItem(GAIA_BUTTON_POSITION_KEY)).toBe(
            JSON.stringify({ x: 914, y: 588 }),
        )

        jest.runAllTimers()
        button.click()

        expect(clickSpy).toHaveBeenCalledTimes(1)
    })
})
