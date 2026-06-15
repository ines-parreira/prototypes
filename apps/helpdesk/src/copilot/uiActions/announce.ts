/**
 * Shared, framework-free aria-live announcer for copilot follow mode.
 *
 * A single visually-hidden `role="status"` / `aria-live="polite"` region is
 * created lazily and reused for every announcement (the highlight engine's
 * landing message and the follow-mode state changes), so assistive tech reads
 * them through one consistent channel instead of competing regions.
 *
 * Focus is never moved; messages are only surfaced to AT.
 */

const LIVE_REGION_ID = 'gorgias-copilot-highlight-live-region'

/** Create the live region if absent and return it. */
export function ensureLiveRegion(): HTMLElement {
    const existing = document.getElementById(LIVE_REGION_ID)
    if (existing) return existing
    const region = document.createElement('div')
    region.id = LIVE_REGION_ID
    region.setAttribute('role', 'status')
    region.setAttribute('aria-live', 'polite')
    // Visually hidden but exposed to assistive tech.
    region.style.position = 'absolute'
    region.style.width = '1px'
    region.style.height = '1px'
    region.style.overflow = 'hidden'
    region.style.clipPath = 'inset(50%)'
    region.style.whiteSpace = 'nowrap'
    ;(document.body ?? document.documentElement).appendChild(region)
    return region
}

/** Clear any text currently in the live region. */
export function clearLiveRegion(): void {
    const region = document.getElementById(LIVE_REGION_ID)
    if (region) region.textContent = ''
}

/**
 * Announce `message` politely. The region is created first and the text is set
 * one task later: a region created and populated in the same task is skipped by
 * screen readers. Re-announces the same text by clearing first.
 */
export function announce(message: string): void {
    const region = ensureLiveRegion()
    region.textContent = ''
    setTimeout(() => {
        ensureLiveRegion().textContent = message
    }, 0)
}
