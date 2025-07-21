class DOMMatrixReadOnly {
    m22: number
    constructor(transform: string) {
        const scale = transform?.match(/scale\(([1-9.])\)/)?.[1]
        this.m22 = scale !== undefined ? +scale : 1
    }
}

// ResizeObserver mock
class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
}

export const mockReactFlow = () => {
    global.ResizeObserver = ResizeObserver

    // @ts-ignore
    global.DOMMatrixReadOnly = DOMMatrixReadOnly

    Object.defineProperties(global.HTMLElement.prototype, {
        offsetHeight: {
            get() {
                return parseFloat(this.style.height) || 100
            },
        },
        offsetWidth: {
            get() {
                return parseFloat(this.style.width) || 100
            },
        },
    })
    ;(global.SVGElement as any).prototype.getBBox = () => ({
        x: 0,
        y: 0,
        width: 100,
        height: 100,
    })

    Object.defineProperty(
        global.HTMLElement.prototype,
        'getBoundingClientRect',
        {
            value: () => ({
                x: 0,
                y: 0,
                width: 100,
                height: 100,
                top: 0,
                right: 100,
                bottom: 100,
                left: 0,
            }),
        },
    )
}
