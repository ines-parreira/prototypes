import { createRef } from 'react'

import { renderHook } from '@repo/testing/vitest'
import { act } from '@testing-library/react'
import html2canvas from 'html2canvas'
import {
    afterAll,
    afterEach,
    beforeAll,
    beforeEach,
    describe,
    expect,
    it,
    vi,
} from 'vitest'

import { useExportDashboardToPDF } from '../useExportDashboardToPDF'

const mockAddImage = vi.fn()
const mockSave = vi.fn()
const mockJsPDFCtor = vi.fn()

vi.mock('html2canvas')
vi.mock('jspdf', () => ({
    jsPDF: vi.fn(function jsPDFMock(this: any, opts: unknown) {
        mockJsPDFCtor(opts)
        this.addImage = mockAddImage
        this.save = mockSave
    }),
}))

const mockedHtml2canvas = vi.mocked(html2canvas)

const makeFakeCanvas = (width = 1200, height = 600) =>
    ({
        width,
        height,
        toDataURL: vi.fn(() => 'data:image/png;base64,fake'),
    }) as unknown as HTMLCanvasElement

function makeRef(scrollWidth = 1400) {
    const element = document.createElement('div')
    Object.defineProperty(element, 'scrollWidth', {
        value: scrollWidth,
        configurable: true,
    })
    Object.defineProperty(element, 'scrollHeight', {
        value: 800,
        configurable: true,
    })
    element.scrollIntoView = vi.fn()
    const ref = createRef<HTMLDivElement>()
    Object.defineProperty(ref, 'current', { value: element, writable: true })
    return ref
}

const exportWithRef = async (ref = makeRef(), filename?: string) => {
    const { result } = renderHook(() => useExportDashboardToPDF())
    await act(async () => {
        await result.current.exportToPDF(ref, filename)
    })
    return { ref, result }
}

const captureOncloneOpts = () => mockedHtml2canvas.mock.calls[0][1] as any

const SVG_NS = 'http://www.w3.org/2000/svg'

const realSetTimeout = global.setTimeout
let setTimeoutSpy: ReturnType<typeof vi.spyOn>

beforeAll(() => {
    window.scrollTo = vi.fn() as unknown as typeof window.scrollTo
})

beforeEach(() => {
    vi.clearAllMocks()
    mockedHtml2canvas.mockResolvedValue(makeFakeCanvas())
    // The hook awaits a 100ms timer mid-flight and schedules a 3s reset at
    // the end — both are implementation details, so flatten setTimeout to
    // fire callbacks synchronously.
    setTimeoutSpy = vi.spyOn(global, 'setTimeout').mockImplementation((cb) => {
        if (typeof cb === 'function') cb()
        return 0 as unknown as ReturnType<typeof setTimeout>
    })
})

afterEach(() => {
    setTimeoutSpy.mockRestore()
})

afterAll(() => {
    global.setTimeout = realSetTimeout
    vi.restoreAllMocks()
})

describe('useExportDashboardToPDF', () => {
    it('starts idle', () => {
        const { result } = renderHook(() => useExportDashboardToPDF())

        expect(result.current).toMatchObject({
            isLoading: false,
            isSuccess: false,
            isError: false,
            error: null,
        })
    })

    it('exits with an error when the element ref is empty', async () => {
        const { result } = await exportWithRef(createRef<HTMLDivElement>())

        expect(result.current.isError).toBe(true)
        expect(result.current.error?.message).toBe(
            'Element reference is not available',
        )
        expect(mockedHtml2canvas).not.toHaveBeenCalled()
    })

    it('captures the element and saves a compressed landscape A4 PDF', async () => {
        Object.defineProperty(window, 'scrollY', {
            value: 250,
            configurable: true,
            writable: true,
        })
        const { ref } = await exportWithRef()

        expect(mockedHtml2canvas).toHaveBeenCalledWith(
            ref.current,
            expect.objectContaining({
                scale: 2,
                useCORS: true,
                backgroundColor: '#ffffff',
                allowTaint: false,
                foreignObjectRendering: false,
                logging: false,
                imageTimeout: 0,
                width: 1400,
                windowWidth: 1400,
                height: 800,
                windowHeight: 800,
            }),
        )
        expect(mockJsPDFCtor).toHaveBeenCalledWith(
            expect.objectContaining({
                orientation: 'landscape',
                format: 'a4',
                unit: 'mm',
                compress: true,
            }),
        )
        expect(mockAddImage).toHaveBeenCalledWith(
            'data:image/png;base64,fake',
            'PNG',
            expect.any(Number),
            expect.any(Number),
            expect.any(Number),
            expect.any(Number),
            undefined,
            'FAST',
        )
        expect(mockSave).toHaveBeenCalledTimes(1)
        expect(ref.current!.scrollIntoView).toHaveBeenCalledWith({
            behavior: 'instant',
            block: 'start',
        })
        expect(window.scrollTo).toHaveBeenCalledWith({
            top: 250,
            behavior: 'instant',
        })
    })

    describe('filename', () => {
        it('uses the provided filename when one is passed', async () => {
            await exportWithRef(makeRef(), 'custom-report.pdf')
            expect(mockSave).toHaveBeenCalledWith('custom-report.pdf')
        })

        it('falls back to a dated default when none is provided', async () => {
            await exportWithRef()
            expect(mockSave).toHaveBeenCalledWith(
                expect.stringMatching(
                    /^analytics-overview-\d{4}-\d{2}-\d{2}\.pdf$/,
                ),
            )
        })
    })

    describe('failed export', () => {
        it('captures Error instances thrown by html2canvas', async () => {
            const failure = new Error('canvas blew up')
            mockedHtml2canvas.mockRejectedValueOnce(failure)

            const { result } = await exportWithRef()

            expect(result.current.error).toBe(failure)
            expect(mockSave).not.toHaveBeenCalled()
        })

        it('wraps non-Error throws in a generic Error', async () => {
            mockedHtml2canvas.mockRejectedValueOnce('plain string failure')
            const { result } = await exportWithRef()
            expect(result.current.error?.message).toBe('Failed to export PDF')
        })
    })

    describe('capture width', () => {
        it('uses element.scrollWidth when it is wider than the minimum', async () => {
            const { ref } = await exportWithRef(makeRef(1600))
            expect(mockedHtml2canvas).toHaveBeenCalledWith(
                ref.current,
                expect.objectContaining({ width: 1600, windowWidth: 1600 }),
            )
        })

        it('falls back to MIN_CAPTURE_WIDTH (1200) for narrow elements', async () => {
            const { ref } = await exportWithRef(makeRef(600))
            expect(mockedHtml2canvas).toHaveBeenCalledWith(
                ref.current,
                expect.objectContaining({ width: 1200, windowWidth: 1200 }),
            )
        })
    })

    it('letterboxes portrait canvases by capping height to the page', async () => {
        // Available area is 277mm x 190mm. A 100x600 canvas (aspect 0.166)
        // would project to ~1668mm tall — clamp height to 190mm, recompute
        // width.
        mockedHtml2canvas.mockResolvedValueOnce(makeFakeCanvas(100, 600))
        await exportWithRef()

        const [, , , , width, height] = mockAddImage.mock.calls[0]
        expect(height).toBeCloseTo(190, 5)
        expect(width).toBeCloseTo(190 * (100 / 600), 5)
    })

    describe('onclone DOM transformations', () => {
        it('forces a light theme, expands layout, removes sticky positioning, and hides interactive elements', async () => {
            await exportWithRef()
            const opts = captureOncloneOpts()
            const clonedDoc =
                document.implementation.createHTMLDocument('clone')

            clonedDoc.body.classList.add('dark', 'classic')

            const clonedElement = clonedDoc.createElement('div')
            const container = clonedDoc.createElement('div')
            container.className = 'some-container-x'
            const kpis = clonedDoc.createElement('div')
            kpis.className = 'kpisSection-y'
            const sticky = clonedDoc.createElement('header')
            sticky.className = 'page-stickyHeader-abc'
            sticky.style.position = 'sticky'
            sticky.style.top = '0'
            const buttonGroup = clonedDoc.createElement('div')
            buttonGroup.className = 'buttongroup-group-foo'
            const excluded = clonedDoc.createElement('span')
            excluded.setAttribute('data-pdf-exclude', 'true')
            clonedElement.append(container, kpis, sticky)
            clonedDoc.body.append(clonedElement, buttonGroup, excluded)

            await opts.onclone(clonedDoc, clonedElement)

            expect(clonedDoc.body.classList.contains('dark')).toBe(false)
            expect(clonedDoc.body.classList.contains('classic')).toBe(false)
            expect(clonedDoc.body.classList.contains('light')).toBe(true)
            expect(clonedElement.style.width).toBe('1400px')
            expect(clonedElement.style.minWidth).toBe('1400px')
            expect(clonedElement.style.maxWidth).toBe('none')
            expect(clonedElement.style.overflow).toBe('visible')
            expect(container.style.width).toBe('100%')
            expect(kpis.style.width).toBe('100%')
            expect(sticky.style.position).toBe('relative')
            expect(sticky.style.top).toBe('auto')
            expect(buttonGroup.style.display).toBe('none')
            expect(excluded.style.display).toBe('none')
        })
    })

    describe('onclone svg <use> inlining', () => {
        const runOnclone = async (clonedDoc: Document) => {
            await exportWithRef()
            const opts = captureOncloneOpts()
            const clonedElement = clonedDoc.createElement('div')
            clonedDoc.body.appendChild(clonedElement)
            await opts.onclone(clonedDoc, clonedElement)
        }

        const stubGlobalGetElementById = (clonedDoc: Document) =>
            vi
                .spyOn(document, 'getElementById')
                .mockImplementation((id) =>
                    clonedDoc.getElementById.call(clonedDoc, id),
                )

        it('copies a local symbol (children + viewBox) into the parent svg', async () => {
            const clonedDoc =
                document.implementation.createHTMLDocument('clone')
            const symbol = clonedDoc.createElementNS(SVG_NS, 'symbol')
            symbol.setAttribute('id', 'my-icon')
            symbol.setAttribute('viewBox', '0 0 24 24')
            symbol.appendChild(clonedDoc.createElementNS(SVG_NS, 'path'))
            clonedDoc.body.appendChild(symbol)

            const svg = clonedDoc.createElementNS(SVG_NS, 'svg')
            const use = clonedDoc.createElementNS(SVG_NS, 'use')
            use.setAttribute('href', '#my-icon')
            svg.appendChild(use)
            clonedDoc.body.appendChild(svg)

            const spy = stubGlobalGetElementById(clonedDoc)
            try {
                await runOnclone(clonedDoc)
            } finally {
                spy.mockRestore()
            }

            expect(svg.getAttribute('viewBox')).toBe('0 0 24 24')
            expect(svg.querySelector('path')).not.toBeNull()
        })

        it('falls back to xlink:href and skips when href is missing or the symbol cannot be found', async () => {
            const clonedDoc =
                document.implementation.createHTMLDocument('clone')

            const xlinkSymbol = clonedDoc.createElementNS(SVG_NS, 'symbol')
            xlinkSymbol.setAttribute('id', 'xlink-icon')
            xlinkSymbol.appendChild(clonedDoc.createElementNS(SVG_NS, 'path'))
            clonedDoc.body.appendChild(xlinkSymbol)

            const xlinkSvg = clonedDoc.createElementNS(SVG_NS, 'svg')
            const xlinkUse = clonedDoc.createElementNS(SVG_NS, 'use')
            xlinkUse.setAttribute('xlink:href', '#xlink-icon')
            xlinkSvg.appendChild(xlinkUse)

            const noHrefSvg = clonedDoc.createElementNS(SVG_NS, 'svg')
            noHrefSvg.appendChild(clonedDoc.createElementNS(SVG_NS, 'use'))

            const missingSvg = clonedDoc.createElementNS(SVG_NS, 'svg')
            const missingUse = clonedDoc.createElementNS(SVG_NS, 'use')
            missingUse.setAttribute('href', '#does-not-exist')
            missingSvg.appendChild(missingUse)

            clonedDoc.body.append(xlinkSvg, noHrefSvg, missingSvg)

            const spy = stubGlobalGetElementById(clonedDoc)
            try {
                await runOnclone(clonedDoc)
            } finally {
                spy.mockRestore()
            }

            expect(xlinkSvg.querySelector('path')).not.toBeNull()
            // Both the missing-symbol and no-href svgs remain unchanged.
            expect(missingSvg.querySelector('path')).toBeNull()
            expect(noHrefSvg.querySelector('path')).toBeNull()
        })

        it('does not overwrite an existing viewBox on the parent svg', async () => {
            const clonedDoc =
                document.implementation.createHTMLDocument('clone')
            const symbol = clonedDoc.createElementNS(SVG_NS, 'symbol')
            symbol.setAttribute('id', 'icon-with-vb')
            symbol.setAttribute('viewBox', '0 0 24 24')
            symbol.appendChild(clonedDoc.createElementNS(SVG_NS, 'path'))
            clonedDoc.body.appendChild(symbol)

            const svg = clonedDoc.createElementNS(SVG_NS, 'svg')
            svg.setAttribute('viewBox', '0 0 100 100')
            const use = clonedDoc.createElementNS(SVG_NS, 'use')
            use.setAttribute('href', '#icon-with-vb')
            svg.appendChild(use)
            clonedDoc.body.appendChild(svg)

            const spy = stubGlobalGetElementById(clonedDoc)
            try {
                await runOnclone(clonedDoc)
            } finally {
                spy.mockRestore()
            }

            expect(svg.getAttribute('viewBox')).toBe('0 0 100 100')
            expect(svg.querySelector('path')).not.toBeNull()
        })

        it('inlines an external sprite via fetch and caches it per base url', async () => {
            const clonedDoc =
                document.implementation.createHTMLDocument('clone')
            clonedDoc.body.innerHTML = `
                <svg id="a"><use href="/sprite.svg#icon-a"></use></svg>
                <svg id="b"><use href="/sprite.svg#icon-b"></use></svg>
            `

            const fetchSpy = vi.fn().mockResolvedValue({
                text: async () => `<?xml version="1.0"?>
                    <svg xmlns="http://www.w3.org/2000/svg">
                        <symbol id="icon-a" viewBox="0 0 16 16"><circle r="1"/></symbol>
                        <symbol id="icon-b"><rect width="2" height="2"/></symbol>
                    </svg>`,
            } as unknown as Response)
            const originalFetch = global.fetch
            global.fetch = fetchSpy as unknown as typeof global.fetch

            try {
                await runOnclone(clonedDoc)
            } finally {
                global.fetch = originalFetch
            }

            // Single fetch reused across two <use> elements sharing the URL.
            expect(fetchSpy).toHaveBeenCalledTimes(1)
            expect(fetchSpy).toHaveBeenCalledWith('/sprite.svg')
            const svgA = clonedDoc.querySelector('#a')!
            expect(svgA.getAttribute('viewBox')).toBe('0 0 16 16')
            expect(svgA.querySelector('circle')).not.toBeNull()
            expect(clonedDoc.querySelector('#b rect')).not.toBeNull()
        })

        it('swallows fetch failures and leaves the svg untouched', async () => {
            const clonedDoc =
                document.implementation.createHTMLDocument('clone')
            clonedDoc.body.innerHTML =
                '<svg><use href="/icons.svg#external-icon"></use></svg>'

            const fetchSpy = vi
                .fn()
                .mockRejectedValue(new Error('network down'))
            const originalFetch = global.fetch
            global.fetch = fetchSpy as unknown as typeof global.fetch

            try {
                await expect(runOnclone(clonedDoc)).resolves.not.toThrow()
            } finally {
                global.fetch = originalFetch
            }

            expect(clonedDoc.querySelector('rect')).toBeNull()
        })
    })
})
