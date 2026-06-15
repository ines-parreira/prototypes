/**
 * Framework-free DOM highlight engine for copilot follow mode.
 *
 * `highlightAnchor` resolves an ordered list of anchor ids (stamped on host
 * pages as `data-copilot-anchor` attributes) to a DOM element, scrolls it
 * into view and traces a brand-gradient border around it.
 *
 * The highlight is an overlay, not a class on the target: a `position: fixed`
 * layer is mounted over the element's exact rect (with its computed corner
 * radius) and a single SVG stroke draws the perimeter once, then fades. The
 * overlay rAF-follows the target for the life of the animation so it stays
 * aligned through the smooth `scrollIntoView` and any scroll-container
 * movement. The target only carries a `data-copilot-highlighted` state marker.
 *
 * Resolution is async: post-navigation renders and react-query refetches can
 * mount the anchored element well after the call, so absent anchors are
 * watched with a MutationObserver plus an interval poll, bounded by an
 * overall timeout. The watchers keep running for the whole highlight
 * lifetime and re-resolve by attribute on every tick, so a refetch re-render
 * that swaps the DOM node moves the overlay instead of orphaning it, and a
 * late-appearing section anchor takes over from the entity fallback.
 *
 * The handle is returned synchronously so callers can dismiss at any moment;
 * `outcome` is a promise that settles on the first landing ('section' when
 * the matched anchor id has a section segment, 'entity' otherwise) or with
 * 'none' when the watch times out or is dismissed before landing.
 *
 * Only one highlight is active at a time: starting a new one disposes the
 * previous. Once landed, Escape or a click anywhere dismisses early. Focus is
 * never moved; landing is announced through a reused aria-live region.
 */

import { COPILOT_ANCHOR_ATTRIBUTE } from '../anchors'
import { clearLiveRegion, ensureLiveRegion } from '../announce'

export type HighlightOutcome = 'section' | 'entity' | 'none'

export type HighlightAnchorOptions = {
    /** Anchor ids in priority order (section first, then entity fallback). */
    candidates: string[]
    /**
     * Accessible message announced via the aria-live region when the
     * highlight lands. Built by the caller from the intent's reason/title.
     */
    announce?: string
}

export type HighlightHandle = {
    /** Settles on first landing, or with 'none' on timeout/early dismissal. */
    outcome: Promise<HighlightOutcome>
    /** Ends the highlight (or the pending watch) immediately. */
    dismiss: () => void
}

/** State marker set on the element the overlay is currently tracking. */
export const COPILOT_HIGHLIGHT_MARKER_ATTRIBUTE = 'data-copilot-highlighted'

const STYLE_ELEMENT_ID = 'gorgias-copilot-highlight-style'
const OVERLAY_ROOT_ID = 'gorgias-copilot-highlight-overlay-root'

// Just below the max 32-bit z-index so the highlight floats above app chrome
// (panels, sticky headers) without colliding with the very top of the stack.
const OVERLAY_Z_INDEX = '2147483000'

const TRACE_STROKE_WIDTH = 2
// Gap between the target's edge and the inner edge of the trace stroke.
const HIGHLIGHT_PADDING_PX = 2
// The overlay box extends past the target by the padding plus the full stroke
// width. The stroke is centred on a path inset half its width from the box
// edge, so this lands the stroke's inner edge HIGHLIGHT_PADDING_PX outside the
// target (like an outline-offset that frames the content without touching it).
const OVERLAY_OFFSET_PX = HIGHLIGHT_PADDING_PX + TRACE_STROKE_WIDTH
// Floor the corner radius so even square-cornered targets get a softly
// rounded trace rather than sharp 90-degree corners.
const MIN_CORNER_RADIUS_PX = 8
// Sub-pixel slack when deciding whether a clipper truncates the target: a
// clipper whose edge merely hugs the target's (landing a fraction inside it)
// is not treated as a cut, so it does not pinch the padding on that edge.
const CLIP_CUT_EPSILON_PX = 0.5

const SVG_NS = 'http://www.w3.org/2000/svg'

/** Covers post-navigation render plus a react-query refetch. */
const RESOLVE_TIMEOUT_MS = 8000
const POLL_INTERVAL_MS = 500
/** The border draws over ~1.5s, then fades over ~0.4s. */
const MOTION_CLEAR_DELAY_MS = 1950
/** The calm reduced-motion ring fades in, holds, then fades out. */
const REDUCED_MOTION_CLEAR_DELAY_MS = 2000

// Brand AI gradient stops (axiom --ai-border): warm coral -> violet -> purple.
const AI_GRADIENT_STOPS: { offset: string; color: string }[] = [
    { offset: '0%', color: '#ff9780' },
    { offset: '40%', color: '#df8ff8' },
    { offset: '75%', color: '#a084e1' },
    { offset: '100%', color: '#754dec' },
]

const HIGHLIGHT_CSS = `
@keyframes gorgias-copilot-trace-draw {
    to { stroke-dashoffset: 0; }
}

@keyframes gorgias-copilot-trace-fade {
    to { opacity: 0; }
}

@keyframes gorgias-copilot-trace-calm {
    0% { opacity: 0; }
    20% { opacity: 1; }
    70% { opacity: 1; }
    100% { opacity: 0; }
}
`

function injectHighlightStyles(): void {
    const existing = document.getElementById(STYLE_ELEMENT_ID)
    if (existing) {
        // Self-heal a stale stylesheet left by an earlier build (e.g. an HMR
        // swap during dev): if the keyframes changed, the animations would
        // reference names that no longer exist and silently never play.
        if (existing.textContent !== HIGHLIGHT_CSS) {
            existing.textContent = HIGHLIGHT_CSS
        }
        return
    }
    const style = document.createElement('style')
    style.id = STYLE_ELEMENT_ID
    style.textContent = HIGHLIGHT_CSS
    document.head.appendChild(style)
}

function prefersReducedMotion(): boolean {
    return (
        typeof window.matchMedia === 'function' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches
    )
}

function attributeSelector(anchorId: string): string {
    const escaped = anchorId.replace(/["\\]/g, '\\$&')
    return `[${COPILOT_ANCHOR_ATTRIBUTE}="${escaped}"]`
}

type CandidateMatch = {
    element: Element
    index: number
}

function resolveCandidates(candidates: string[]): CandidateMatch | null {
    for (let index = 0; index < candidates.length; index++) {
        const element = document.querySelector(
            attributeSelector(candidates[index]),
        )
        if (element) return { element, index }
    }
    return null
}

/** First numeric pixel value of a `border-radius` string ("8px 8px" -> 8). */
function parseRadiusPx(radius: string): number {
    const match = radius.match(/([\d.]+)px/)
    return match ? Number(match[1]) : 0
}

function getOverlayRoot(): HTMLElement {
    const existing = document.getElementById(OVERLAY_ROOT_ID)
    if (existing) return existing
    const root = document.createElement('div')
    root.id = OVERLAY_ROOT_ID
    root.style.cssText = `
        position: fixed;
        inset: 0;
        pointer-events: none;
        z-index: ${OVERLAY_Z_INDEX};
    `
    document.body.appendChild(root)
    return root
}

type ClipAncestor = { el: Element; clipsX: boolean; clipsY: boolean }

/**
 * Walks up from `element` collecting ancestors that clip overflow on either
 * axis (any `overflow` value other than `visible`). Read once per highlight:
 * the chain is stable across the ~2s animation, so `getComputedStyle` stays
 * out of the per-frame sync loop and each frame only re-reads cheap rects.
 */
function collectClipAncestors(element: Element): ClipAncestor[] {
    const clippers: ClipAncestor[] = []
    let current = element.parentElement
    while (current && current !== document.documentElement) {
        const style = window.getComputedStyle(current)
        const clipsX = style.overflowX !== 'visible'
        const clipsY = style.overflowY !== 'visible'
        if (clipsX || clipsY) clippers.push({ el: current, clipsX, clipsY })
        current = current.parentElement
    }
    return clippers
}

let gradientUid = 0

/**
 * Mounts the gradient-border-trace overlay over `element` and returns a
 * teardown that stops following and removes the overlay.
 */
function createTraceOverlay(
    element: Element,
    reducedMotion: boolean,
): () => void {
    const root = getOverlayRoot()
    const clipAncestors = collectClipAncestors(element)
    const computedRadius =
        window.getComputedStyle(element).borderRadius || '0px'
    const radiusPx =
        Math.max(parseRadiusPx(computedRadius), MIN_CORNER_RADIUS_PX) +
        OVERLAY_OFFSET_PX

    const box = document.createElement('div')
    box.style.cssText = `
        position: absolute;
        box-sizing: border-box;
        pointer-events: none;
        border-radius: ${radiusPx}px;
    `
    root.appendChild(box)

    gradientUid += 1
    const gradientId = `gorgias-copilot-trace-gradient-${gradientUid}`

    const svg = document.createElementNS(SVG_NS, 'svg')
    svg.setAttribute('fill', 'none')
    svg.setAttribute('preserveAspectRatio', 'none')
    svg.style.cssText =
        'position:absolute; inset:0; width:100%; height:100%; overflow:visible;'

    const defs = document.createElementNS(SVG_NS, 'defs')
    const gradient = document.createElementNS(SVG_NS, 'linearGradient')
    gradient.setAttribute('id', gradientId)
    gradient.setAttribute('x1', '0%')
    gradient.setAttribute('y1', '0%')
    gradient.setAttribute('x2', '100%')
    gradient.setAttribute('y2', '100%')
    for (const stop of AI_GRADIENT_STOPS) {
        const stopEl = document.createElementNS(SVG_NS, 'stop')
        stopEl.setAttribute('offset', stop.offset)
        stopEl.setAttribute('stop-color', stop.color)
        gradient.appendChild(stopEl)
    }
    defs.appendChild(gradient)
    svg.appendChild(defs)

    const rect = document.createElementNS(SVG_NS, 'rect')
    rect.setAttribute('fill', 'none')
    rect.setAttribute('stroke', `url(#${gradientId})`)
    rect.setAttribute('stroke-width', String(TRACE_STROKE_WIDTH))
    rect.setAttribute('stroke-linejoin', 'round')
    svg.appendChild(rect)
    box.appendChild(svg)

    if (reducedMotion) {
        svg.style.animation = `gorgias-copilot-trace-calm ${
            REDUCED_MOTION_CLEAR_DELAY_MS - 100
        }ms ease-in-out forwards`
    } else {
        // pathLength normalises the perimeter to 100 user units regardless of
        // the rect's real size, so one dashoffset keyframe draws any shape.
        rect.setAttribute('pathLength', '100')
        rect.setAttribute('stroke-dasharray', '100')
        rect.setAttribute('stroke-dashoffset', '100')
        rect.style.animation =
            'gorgias-copilot-trace-draw 1.5s ease-out forwards'
        svg.style.animation =
            'gorgias-copilot-trace-fade 0.4s ease-out 1.5s forwards'
    }

    function sync(): void {
        // Box the *visible* region: the padded target rect clamped to every
        // overflow-clipping ancestor and the viewport. A fully-visible target
        // yields the full padded rect unchanged (no regression); a scrolled or
        // truncated one is trimmed to what actually shows, so the trace never
        // paints over app chrome or past the viewport.
        const targetRect = element.getBoundingClientRect()
        let left = targetRect.left - OVERLAY_OFFSET_PX
        let top = targetRect.top - OVERLAY_OFFSET_PX
        let right = targetRect.right + OVERLAY_OFFSET_PX
        let bottom = targetRect.bottom + OVERLAY_OFFSET_PX

        // Trim only the edges a clipper cuts *through* the target. A clipper
        // that merely hugs the target on an axis (the title input's
        // overflow-hidden wrapper is exactly its height) must not pull the box
        // inward there — that would pinch the padding into the content. Where a
        // clipper does truncate the target (scrolled-away or ellipsised
        // content), leave a HIGHLIGHT_PADDING_PX gap inside the cut so the trace
        // does not sit flush against it. Clamp to the padding box (client*
        // insets), not the border box, to skip the border and scrollbar gutter.
        for (const ancestor of clipAncestors) {
            const el = ancestor.el
            const aRect = el.getBoundingClientRect()
            if (ancestor.clipsX) {
                const clipLeft = aRect.left + el.clientLeft
                const clipRight = clipLeft + el.clientWidth
                if (targetRect.left < clipLeft - CLIP_CUT_EPSILON_PX)
                    left = Math.max(left, clipLeft + HIGHLIGHT_PADDING_PX)
                if (targetRect.right > clipRight + CLIP_CUT_EPSILON_PX)
                    right = Math.min(right, clipRight - HIGHLIGHT_PADDING_PX)
            }
            if (ancestor.clipsY) {
                const clipTop = aRect.top + el.clientTop
                const clipBottom = clipTop + el.clientHeight
                if (targetRect.top < clipTop - CLIP_CUT_EPSILON_PX)
                    top = Math.max(top, clipTop + HIGHLIGHT_PADDING_PX)
                if (targetRect.bottom > clipBottom + CLIP_CUT_EPSILON_PX)
                    bottom = Math.min(bottom, clipBottom - HIGHLIGHT_PADDING_PX)
            }
        }

        // Same rule against the viewport: only pull in edges that genuinely run
        // off-screen, so a target near (but inside) an edge keeps its padding.
        const docEl = document.documentElement
        const viewportWidth = docEl.clientWidth
        const viewportHeight = docEl.clientHeight
        if (targetRect.left < 0) left = Math.max(left, HIGHLIGHT_PADDING_PX)
        if (targetRect.top < 0) top = Math.max(top, HIGHLIGHT_PADDING_PX)
        if (targetRect.right > viewportWidth)
            right = Math.min(right, viewportWidth - HIGHLIGHT_PADDING_PX)
        if (targetRect.bottom > viewportHeight)
            bottom = Math.min(bottom, viewportHeight - HIGHLIGHT_PADDING_PX)

        const width = right - left
        const height = bottom - top

        // Fully scrolled out of every clipper: collapse to nothing and skip the
        // SVG geometry so no degenerate viewBox renders. The CSS animation
        // keeps running, so scrolling the target back into view mid-animation
        // brings the trace back (display:none would reset the running draw).
        if (width <= 0 || height <= 0) {
            box.style.left = `${left}px`
            box.style.top = `${top}px`
            box.style.width = '0px'
            box.style.height = '0px'
            return
        }

        box.style.left = `${left}px`
        box.style.top = `${top}px`
        box.style.width = `${width}px`
        box.style.height = `${height}px`
        svg.setAttribute('viewBox', `0 0 ${width} ${height}`)
        const inset = TRACE_STROKE_WIDTH / 2
        rect.setAttribute('x', String(inset))
        rect.setAttribute('y', String(inset))
        rect.setAttribute(
            'width',
            String(Math.max(0, width - TRACE_STROKE_WIDTH)),
        )
        rect.setAttribute(
            'height',
            String(Math.max(0, height - TRACE_STROKE_WIDTH)),
        )
        // Clamp the radius to the (possibly smaller) visible box so a thin
        // visible band does not render an oversized arc.
        const corner = Math.max(
            0,
            Math.min(radiusPx, width / 2, height / 2) - inset,
        )
        rect.setAttribute('rx', String(corner))
        rect.setAttribute('ry', String(corner))
    }

    sync()
    let rafId = requestAnimationFrame(function follow() {
        sync()
        rafId = requestAnimationFrame(follow)
    })

    return function removeOverlay(): void {
        cancelAnimationFrame(rafId)
        box.remove()
        if (root.childElementCount === 0) root.remove()
    }
}

/**
 * Plays the gradient-border-trace once on a specific element, bypassing anchor
 * resolution. Returns a teardown that removes the overlay. Intended for
 * previewing the animation directly on a known DOM node.
 */
export function playTraceHighlight(element: Element): () => void {
    injectHighlightStyles()
    return createTraceOverlay(element, prefersReducedMotion())
}

let disposeActiveHighlight: (() => void) | null = null

export function highlightAnchor(
    options: HighlightAnchorOptions,
): HighlightHandle {
    const { announce } = options
    // Copy: the caller may mutate its array during the watch window.
    const candidates = [...options.candidates]

    disposeActiveHighlight?.()

    let resolveOutcome: (outcome: HighlightOutcome) => void = () => {}
    const outcome = new Promise<HighlightOutcome>((resolve) => {
        resolveOutcome = resolve
    })

    if (candidates.length === 0) {
        resolveOutcome('none')
        return { outcome, dismiss: () => {} }
    }

    injectHighlightStyles()
    // Create the live region ahead of the announcement: a region created and
    // populated in the same task is skipped by screen readers.
    ensureLiveRegion()

    const reducedMotion = prefersReducedMotion()

    let disposed = false
    let landed = false
    let highlighted: Element | null = null
    let disposeOverlay: (() => void) | null = null
    let observer: MutationObserver | null = null
    let pollId: ReturnType<typeof setInterval> | null = null
    let timeoutId: ReturnType<typeof setTimeout> | null = null
    let clearId: ReturnType<typeof setTimeout> | null = null
    let announceId: ReturnType<typeof setTimeout> | null = null
    let listenersId: ReturnType<typeof setTimeout> | null = null
    let dismissListenersAttached = false

    function onKeydown(event: KeyboardEvent): void {
        if (event.key !== 'Escape') return
        // Absorb the key so dismissing the highlight does not also advance
        // the host app's Escape ladder (closing panels or modals).
        event.stopPropagation()
        dispose()
    }

    function onClick(): void {
        dispose()
    }

    function clearHighlightedElement(): void {
        disposeOverlay?.()
        disposeOverlay = null
        highlighted?.removeAttribute(COPILOT_HIGHLIGHT_MARKER_ATTRIBUTE)
        highlighted = null
    }

    function dispose(): void {
        if (disposed) return
        disposed = true
        observer?.disconnect()
        if (pollId !== null) clearInterval(pollId)
        if (timeoutId !== null) clearTimeout(timeoutId)
        if (clearId !== null) clearTimeout(clearId)
        if (announceId !== null) clearTimeout(announceId)
        if (listenersId !== null) clearTimeout(listenersId)
        if (dismissListenersAttached) {
            document.removeEventListener('keydown', onKeydown, true)
            document.removeEventListener('click', onClick, true)
        }
        // Clear so stale announcements do not linger for AT users and the
        // next identical announcement re-announces.
        clearLiveRegion()
        clearHighlightedElement()
        if (disposeActiveHighlight === dispose) disposeActiveHighlight = null
        if (!landed) resolveOutcome('none')
    }

    function applyHighlight(element: Element, scroll: boolean): void {
        // A fresh overlay per target restarts the trace draw from the start,
        // so re-highlighting (a rapid re-trigger, or a refetch node swap)
        // re-plays the animation rather than leaving a finished one behind.
        if (highlighted !== element) {
            clearHighlightedElement()
            highlighted = element
            element.setAttribute(COPILOT_HIGHLIGHT_MARKER_ATTRIBUTE, '')
            disposeOverlay = createTraceOverlay(element, reducedMotion)
        }
        if (scroll) {
            element.scrollIntoView({
                block: 'center',
                behavior: reducedMotion ? 'auto' : 'smooth',
            })
        }
    }

    function land(match: CandidateMatch): void {
        landed = true
        applyHighlight(match.element, true)
        if (announce) {
            // Populate one tick after the region was created so screen
            // readers pick up the change.
            announceId = setTimeout(() => {
                announceId = null
                ensureLiveRegion().textContent = announce
            }, 0)
        }
        // Defer attachment by a task so the activating interaction (a
        // keyboard activation's synthesized click, or a pointerdown-triggered
        // flow) cannot instantly dismiss the highlight.
        listenersId = setTimeout(() => {
            listenersId = null
            document.addEventListener('keydown', onKeydown, true)
            document.addEventListener('click', onClick, true)
            dismissListenersAttached = true
        }, 0)
        if (timeoutId !== null) {
            clearTimeout(timeoutId)
            timeoutId = null
        }
        clearId = setTimeout(
            dispose,
            reducedMotion
                ? REDUCED_MOTION_CLEAR_DELAY_MS
                : MOTION_CLEAR_DELAY_MS,
        )
        // Anchor ids carry their scope in their shape: a section anchor has a
        // trailing section segment (entity:id:section), an entity anchor only
        // entity:id.
        resolveOutcome(
            candidates[match.index].split(':').length >= 3
                ? 'section'
                : 'entity',
        )
    }

    function tick(): void {
        if (disposed) return
        const match = resolveCandidates(candidates)
        if (!match) {
            // The anchored node vanished mid-highlight (refetch re-render);
            // drop the overlay and keep watching for it to come back.
            if (highlighted) clearHighlightedElement()
            return
        }
        if (!landed) {
            land(match)
        } else if (match.element !== highlighted) {
            applyHighlight(match.element, false)
        }
    }

    disposeActiveHighlight = dispose

    observer = new MutationObserver(tick)
    observer.observe(document.documentElement, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: [COPILOT_ANCHOR_ATTRIBUTE],
    })
    pollId = setInterval(tick, POLL_INTERVAL_MS)

    const initial = resolveCandidates(candidates)
    if (initial) {
        land(initial)
    } else {
        timeoutId = setTimeout(dispose, RESOLVE_TIMEOUT_MS)
    }

    return { outcome, dismiss: dispose }
}
