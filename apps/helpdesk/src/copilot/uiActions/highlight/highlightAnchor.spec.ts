import { COPILOT_ANCHOR_ATTRIBUTE } from '../anchors'
import type { HighlightHandle } from './highlightAnchor'
import {
    COPILOT_HIGHLIGHT_MARKER_ATTRIBUTE,
    highlightAnchor,
} from './highlightAnchor'

function addAnchor(anchorId: string): HTMLElement {
    const element = document.createElement('div')
    element.setAttribute(COPILOT_ANCHOR_ATTRIBUTE, anchorId)
    document.body.appendChild(element)
    return element
}

function hasHighlight(element: Element): boolean {
    return element.hasAttribute(COPILOT_HIGHLIGHT_MARKER_ATTRIBUTE)
}

// White-box peek at the mounted overlay node; its id is an internal layout
// detail of the engine.
function currentOverlayBox(): Element | null {
    return (
        document.getElementById('gorgias-copilot-highlight-overlay-root')
            ?.firstElementChild ?? null
    )
}

function mockReducedMotion(matches: boolean): void {
    jest.spyOn(window, 'matchMedia').mockReturnValue({
        matches,
    } as unknown as MediaQueryList)
}

describe('highlightAnchor', () => {
    let handle: HighlightHandle | null = null

    beforeEach(() => {
        jest.useFakeTimers()
        document.body.innerHTML = ''
        jest.spyOn(window, 'matchMedia').mockReturnValue({
            matches: false,
        } as unknown as MediaQueryList)
    })

    afterEach(() => {
        handle?.dismiss()
        handle = null
        jest.useRealTimers()
        jest.restoreAllMocks()
    })

    it('resolves immediately when the anchor is present and scrolls it into view', async () => {
        const scrollSpy = jest.spyOn(HTMLElement.prototype, 'scrollIntoView')
        const element = addAnchor('skill:1')

        handle = highlightAnchor({ candidates: ['skill:1'] })

        expect(hasHighlight(element)).toBe(true)
        expect(scrollSpy).toHaveBeenCalledWith({
            block: 'center',
            behavior: 'smooth',
        })
        await expect(handle.outcome).resolves.toBe('entity')
    })

    it('resolves later via MutationObserver when the element appears after start', async () => {
        handle = highlightAnchor({
            candidates: ['skill:1:instructions', 'skill:1'],
        })

        const element = addAnchor('skill:1:instructions')
        // Flush the mutation observer microtask without advancing timers so
        // the interval poll cannot be the resolver.
        await Promise.resolve()
        await Promise.resolve()

        expect(hasHighlight(element)).toBe(true)
        await expect(handle.outcome).resolves.toBe('section')
    })

    it('prefers the section candidate over the entity when both are present', async () => {
        const entity = addAnchor('skill:1')
        const section = addAnchor('skill:1:instructions')

        handle = highlightAnchor({
            candidates: ['skill:1:instructions', 'skill:1'],
        })

        expect(hasHighlight(section)).toBe(true)
        expect(hasHighlight(entity)).toBe(false)
        await expect(handle.outcome).resolves.toBe('section')
    })

    it('falls back to the entity anchor when the section anchor never appears', async () => {
        const entity = addAnchor('skill:1')

        handle = highlightAnchor({ candidates: ['skill:1:missing', 'skill:1'] })

        expect(hasHighlight(entity)).toBe(true)
        await expect(handle.outcome).resolves.toBe('entity')
    })

    it('moves the highlight to a late-appearing section anchor', async () => {
        const entity = addAnchor('skill:1')
        handle = highlightAnchor({
            candidates: ['skill:1:instructions', 'skill:1'],
        })
        await expect(handle.outcome).resolves.toBe('entity')

        const section = addAnchor('skill:1:instructions')
        await jest.advanceTimersByTimeAsync(500)

        expect(hasHighlight(entity)).toBe(false)
        expect(hasHighlight(section)).toBe(true)
    })

    it('re-acquires the anchor after a refetch re-render swaps the node', async () => {
        const scrollSpy = jest.spyOn(HTMLElement.prototype, 'scrollIntoView')
        const original = addAnchor('guidance:7:content')
        handle = highlightAnchor({
            candidates: ['guidance:7:content', 'guidance:7'],
        })
        expect(hasHighlight(original)).toBe(true)

        original.remove()
        await jest.advanceTimersByTimeAsync(500)
        const replacement = addAnchor('guidance:7:content')
        await jest.advanceTimersByTimeAsync(500)

        expect(hasHighlight(replacement)).toBe(true)
        // Only the first landing scrolls; re-acquisition migrates the class
        // without moving the viewport again.
        expect(scrollSpy).toHaveBeenCalledTimes(1)
    })

    it('times out with outcome none and cleans up watchers', async () => {
        const disconnectSpy = jest.spyOn(
            MutationObserver.prototype,
            'disconnect',
        )

        handle = highlightAnchor({ candidates: ['skill:404'] })
        await jest.advanceTimersByTimeAsync(8000)

        await expect(handle.outcome).resolves.toBe('none')
        expect(disconnectSpy).toHaveBeenCalled()
        expect(jest.getTimerCount()).toBe(0)
    })

    it('resolves none immediately for an empty candidate list', async () => {
        handle = highlightAnchor({ candidates: [] })
        await expect(handle.outcome).resolves.toBe('none')
        expect(jest.getTimerCount()).toBe(0)
    })

    it('uses auto scroll behavior and a calm ring under prefers-reduced-motion', async () => {
        mockReducedMotion(true)
        const scrollSpy = jest.spyOn(HTMLElement.prototype, 'scrollIntoView')
        const element = addAnchor('skill:1')

        handle = highlightAnchor({ candidates: ['skill:1'] })

        expect(scrollSpy).toHaveBeenCalledWith({
            block: 'center',
            behavior: 'auto',
        })
        // The calm ring clears a touch later than the motion trace.
        await jest.advanceTimersByTimeAsync(1900)
        expect(hasHighlight(element)).toBe(true)
        await jest.advanceTimersByTimeAsync(200)
        expect(hasHighlight(element)).toBe(false)
        expect(jest.getTimerCount()).toBe(0)
    })

    it('removes the highlight after the animation period', async () => {
        mockReducedMotion(false)
        const element = addAnchor('skill:1')

        handle = highlightAnchor({ candidates: ['skill:1'] })
        expect(hasHighlight(element)).toBe(true)

        await jest.advanceTimersByTimeAsync(1950)
        expect(hasHighlight(element)).toBe(false)
        expect(jest.getTimerCount()).toBe(0)
    })

    it('disposes the previous highlight when a new one starts', async () => {
        const first = addAnchor('skill:1')
        const firstHandle = highlightAnchor({ candidates: ['skill:1'] })
        await expect(firstHandle.outcome).resolves.toBe('entity')

        const second = addAnchor('guidance:2')
        handle = highlightAnchor({ candidates: ['guidance:2'] })

        expect(hasHighlight(first)).toBe(false)
        expect(hasHighlight(second)).toBe(true)
    })

    it('resolves none when a new highlight starts before the previous landed', async () => {
        const firstHandle = highlightAnchor({ candidates: ['skill:404'] })
        addAnchor('guidance:2')
        handle = highlightAnchor({ candidates: ['guidance:2'] })

        await expect(firstHandle.outcome).resolves.toBe('none')
        await expect(handle.outcome).resolves.toBe('entity')
    })

    it('dismisses on Escape keydown and absorbs the key', async () => {
        const element = addAnchor('skill:1')
        handle = highlightAnchor({ candidates: ['skill:1'] })
        expect(hasHighlight(element)).toBe(true)
        await jest.advanceTimersByTimeAsync(0)

        const hostListener = jest.fn()
        document.addEventListener('keydown', hostListener)
        element.dispatchEvent(
            new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
        )
        document.removeEventListener('keydown', hostListener)

        expect(hasHighlight(element)).toBe(false)
        // The Escape that dismissed the highlight must not also advance the
        // host app's Escape ladder.
        expect(hostListener).not.toHaveBeenCalled()
        expect(jest.getTimerCount()).toBe(0)
    })

    it('ignores non-Escape keydowns', async () => {
        const element = addAnchor('skill:1')
        handle = highlightAnchor({ candidates: ['skill:1'] })
        await jest.advanceTimersByTimeAsync(0)

        document.dispatchEvent(
            new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }),
        )

        expect(hasHighlight(element)).toBe(true)
    })

    it('dismisses on a click anywhere', async () => {
        const element = addAnchor('skill:1')
        handle = highlightAnchor({ candidates: ['skill:1'] })
        await jest.advanceTimersByTimeAsync(0)

        document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }))

        expect(hasHighlight(element)).toBe(false)
        expect(jest.getTimerCount()).toBe(0)
    })

    it('dismisses when the highlighted element itself is clicked', async () => {
        const element = addAnchor('skill:1')
        handle = highlightAnchor({ candidates: ['skill:1'] })
        await jest.advanceTimersByTimeAsync(0)

        element.dispatchEvent(new MouseEvent('click', { bubbles: true }))

        expect(hasHighlight(element)).toBe(false)
        expect(jest.getTimerCount()).toBe(0)
    })

    it('ignores a click in the same task as the landing, then dismisses on the next one', async () => {
        const element = addAnchor('skill:1')
        handle = highlightAnchor({ candidates: ['skill:1'] })

        // Same task as land(): a keyboard activation's synthesized click or a
        // pointerdown-triggered flow must not instantly dismiss.
        document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }))
        expect(hasHighlight(element)).toBe(true)

        await jest.advanceTimersByTimeAsync(0)
        document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }))
        expect(hasHighlight(element)).toBe(false)
        expect(jest.getTimerCount()).toBe(0)
    })

    it('dismiss() ends a pending watch with outcome none', async () => {
        handle = highlightAnchor({ candidates: ['skill:404'] })

        handle.dismiss()

        await expect(handle.outcome).resolves.toBe('none')
        expect(jest.getTimerCount()).toBe(0)
    })

    it('dismiss() is idempotent across repeated calls and after the timeout', async () => {
        addAnchor('skill:1')
        handle = highlightAnchor({ candidates: ['skill:1'] })

        expect(() => {
            handle?.dismiss()
            handle?.dismiss()
        }).not.toThrow()
        expect(jest.getTimerCount()).toBe(0)

        const timedOut = highlightAnchor({ candidates: ['skill:404'] })
        await jest.advanceTimersByTimeAsync(8000)
        await expect(timedOut.outcome).resolves.toBe('none')
        expect(() => timedOut.dismiss()).not.toThrow()
        expect(jest.getTimerCount()).toBe(0)
    })

    it('remounts the overlay on a rapid re-highlight of the same element', async () => {
        const element = addAnchor('skill:1')
        highlightAnchor({ candidates: ['skill:1'] })
        const firstOverlay = currentOverlayBox()
        expect(firstOverlay).not.toBeNull()

        handle = highlightAnchor({ candidates: ['skill:1'] })

        expect(hasHighlight(element)).toBe(true)
        // A fresh overlay node means the trace draw restarts from the start;
        // re-tracing a finished overlay would otherwise leave it faded out.
        expect(currentOverlayBox()).not.toBe(firstOverlay)
        await expect(handle.outcome).resolves.toBe('entity')
    })

    it('announces the provided message through the aria-live status region', async () => {
        addAnchor('skill:1')
        handle = highlightAnchor({
            candidates: ['skill:1'],
            announce: 'Copilot updated the skill instructions',
        })
        await jest.advanceTimersByTimeAsync(0)

        const region = document.querySelector('[role="status"]')
        expect(region).not.toBeNull()
        expect(region).toHaveTextContent(
            'Copilot updated the skill instructions',
        )
        expect(region).toHaveAttribute('aria-live', 'polite')

        handle.dismiss()
        expect(region?.textContent).toBe('')
    })

    it('creates the live region eagerly and defers the announcement by a tick', async () => {
        addAnchor('skill:1')
        handle = highlightAnchor({
            candidates: ['skill:1'],
            announce: 'Copilot updated the skill instructions',
        })

        const region = document.querySelector('[role="status"]')
        expect(region).not.toBeNull()
        expect(region?.textContent).toBe('')

        await jest.advanceTimersByTimeAsync(0)
        expect(region).toHaveTextContent(
            'Copilot updated the skill instructions',
        )
    })

    it('reports a section outcome for a single section-only candidate list', async () => {
        addAnchor('skill:1:instructions')
        handle = highlightAnchor({ candidates: ['skill:1:instructions'] })

        await expect(handle.outcome).resolves.toBe('section')
    })

    it('does not move focus when the highlight lands', () => {
        const focusSpy = jest.spyOn(HTMLElement.prototype, 'focus')
        addAnchor('skill:1')

        handle = highlightAnchor({
            candidates: ['skill:1'],
            announce: 'Copilot updated the skill',
        })

        expect(focusSpy).not.toHaveBeenCalled()
    })
})
