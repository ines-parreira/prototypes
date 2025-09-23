export function triggerWidthResize(value: number) {
    Object.defineProperty(window, 'innerWidth', { value })

    window.dispatchEvent(new Event('resize'))
}
