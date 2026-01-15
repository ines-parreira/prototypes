import { act, renderHook } from '@testing-library/react'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import moment from 'moment'

import { useExportDashboardToPDF } from './useExportDashboardToPDF'

jest.mock('html2canvas')
jest.mock('jspdf')
jest.mock('moment')

describe('useExportDashboardToPDF', () => {
    let mockCanvas: HTMLCanvasElement
    let mockPDF: jest.Mocked<jsPDF>
    let mockElement: HTMLDivElement

    beforeEach(() => {
        mockCanvas = document.createElement('canvas')
        mockCanvas.width = 1920
        mockCanvas.height = 1080
        mockCanvas.toDataURL = jest
            .fn()
            .mockReturnValue('data:image/png;base64,mock')

        mockPDF = {
            addImage: jest.fn(),
            save: jest.fn(),
        } as unknown as jest.Mocked<jsPDF>
        ;(jsPDF as unknown as jest.Mock).mockImplementation(() => mockPDF)
        ;(html2canvas as unknown as jest.Mock).mockResolvedValue(mockCanvas)
        ;(moment as unknown as jest.Mock).mockReturnValue({
            format: jest.fn().mockReturnValue('2024-01-15'),
        })

        mockElement = document.createElement('div')
        mockElement.scrollIntoView = jest.fn()

        window.scrollTo = jest.fn()
        window.scrollY = 100
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('should initialize with idle status', () => {
        const { result } = renderHook(() => useExportDashboardToPDF())

        expect(result.current.isLoading).toBe(false)
        expect(result.current.isSuccess).toBe(false)
        expect(result.current.isError).toBe(false)
        expect(result.current.error).toBeNull()
    })

    it('should export PDF successfully', async () => {
        const { result } = renderHook(() => useExportDashboardToPDF())
        const elementRef = { current: mockElement }

        await act(async () => {
            await result.current.exportToPDF(elementRef)
        })

        expect(result.current.isSuccess).toBe(true)
        expect(mockPDF.save).toHaveBeenCalledWith(
            'analytics-overview-2024-01-15.pdf',
        )
    })

    it('should export PDF with custom filename', async () => {
        const { result } = renderHook(() => useExportDashboardToPDF())
        const elementRef = { current: mockElement }

        await act(async () => {
            await result.current.exportToPDF(elementRef, 'custom.pdf')
        })

        expect(mockPDF.save).toHaveBeenCalledWith('custom.pdf')
    })

    it('should handle missing element reference', async () => {
        const { result } = renderHook(() => useExportDashboardToPDF())
        const elementRef = { current: null }

        await act(async () => {
            await result.current.exportToPDF(elementRef)
        })

        expect(result.current.isError).toBe(true)
        expect(result.current.error?.message).toBe(
            'Element reference is not available',
        )
    })

    it('should handle canvas creation error', async () => {
        const { result } = renderHook(() => useExportDashboardToPDF())
        const elementRef = { current: mockElement }
        const error = new Error('Canvas failed')

        ;(html2canvas as unknown as jest.Mock).mockRejectedValueOnce(error)

        await act(async () => {
            await result.current.exportToPDF(elementRef)
        })

        expect(result.current.isError).toBe(true)
        expect(result.current.error).toBe(error)
    })

    it('should call html2canvas with correct options', async () => {
        const { result } = renderHook(() => useExportDashboardToPDF())
        const elementRef = { current: mockElement }

        await act(async () => {
            await result.current.exportToPDF(elementRef)
        })

        expect(html2canvas).toHaveBeenCalledWith(mockElement, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff',
            allowTaint: false,
            foreignObjectRendering: false,
            imageTimeout: 0,
            onclone: expect.any(Function),
        })
    })

    it('should scroll element into view', async () => {
        const { result } = renderHook(() => useExportDashboardToPDF())
        const elementRef = { current: mockElement }

        await act(async () => {
            await result.current.exportToPDF(elementRef)
        })

        expect(mockElement.scrollIntoView).toHaveBeenCalledWith({
            behavior: 'instant',
            block: 'start',
        })
    })

    it('should restore scroll position', async () => {
        const { result } = renderHook(() => useExportDashboardToPDF())
        const elementRef = { current: mockElement }

        await act(async () => {
            await result.current.exportToPDF(elementRef)
        })

        expect(window.scrollTo).toHaveBeenCalledWith({
            top: 100,
            behavior: 'instant',
        })
    })

    it('should create PDF with landscape orientation', async () => {
        const { result } = renderHook(() => useExportDashboardToPDF())
        const elementRef = { current: mockElement }

        await act(async () => {
            await result.current.exportToPDF(elementRef)
        })

        expect(jsPDF).toHaveBeenCalledWith({
            orientation: 'landscape',
            unit: 'mm',
            format: 'a4',
            compress: true,
        })
    })

    it('should add image to PDF', async () => {
        const { result } = renderHook(() => useExportDashboardToPDF())
        const elementRef = { current: mockElement }

        await act(async () => {
            await result.current.exportToPDF(elementRef)
        })

        expect(mockPDF.addImage).toHaveBeenCalledWith(
            'data:image/png;base64,mock',
            'PNG',
            expect.any(Number),
            expect.any(Number),
            expect.any(Number),
            expect.any(Number),
            undefined,
            'FAST',
        )
    })

    it('should adjust image width when height exceeds available height', async () => {
        const { result } = renderHook(() => useExportDashboardToPDF())
        const elementRef = { current: mockElement }

        const tallCanvas = document.createElement('canvas')
        tallCanvas.width = 800
        tallCanvas.height = 3000
        tallCanvas.toDataURL = jest
            .fn()
            .mockReturnValue('data:image/png;base64,mock')
        ;(html2canvas as unknown as jest.Mock).mockResolvedValueOnce(tallCanvas)

        await act(async () => {
            await result.current.exportToPDF(elementRef)
        })

        expect(mockPDF.addImage).toHaveBeenCalledWith(
            'data:image/png;base64,mock',
            'PNG',
            expect.any(Number),
            expect.any(Number),
            expect.any(Number),
            expect.any(Number),
            undefined,
            'FAST',
        )

        const call = (mockPDF.addImage as jest.Mock).mock.calls[0]
        const imgHeight = call[5]

        const availableHeight = 210 - 10 * 2
        expect(imgHeight).toBeLessThanOrEqual(availableHeight)
    })

    it('should reset status to idle after success', async () => {
        jest.useFakeTimers()
        const { result } = renderHook(() => useExportDashboardToPDF())
        const elementRef = { current: mockElement }

        await act(async () => {
            const exportPromise = result.current.exportToPDF(elementRef)
            await jest.advanceTimersByTimeAsync(100)
            await exportPromise
        })

        expect(result.current.isSuccess).toBe(true)

        await act(async () => {
            await jest.advanceTimersByTimeAsync(3000)
        })

        expect(result.current.isSuccess).toBe(false)
        expect(result.current.isLoading).toBe(false)
        expect(result.current.isError).toBe(false)
        jest.useRealTimers()
    })

    it('should reset status to idle after error', async () => {
        jest.useFakeTimers()
        const { result } = renderHook(() => useExportDashboardToPDF())
        const elementRef = { current: mockElement }
        const error = new Error('Canvas failed')

        ;(html2canvas as unknown as jest.Mock).mockRejectedValueOnce(error)

        await act(async () => {
            const exportPromise = result.current.exportToPDF(elementRef)
            await jest.advanceTimersByTimeAsync(100)
            await exportPromise
        })

        expect(result.current.isError).toBe(true)

        await act(async () => {
            await jest.advanceTimersByTimeAsync(3000)
        })

        expect(result.current.isError).toBe(false)
        expect(result.current.isLoading).toBe(false)
        jest.useRealTimers()
    })

    it('should handle non-Error exceptions', async () => {
        const { result } = renderHook(() => useExportDashboardToPDF())
        const elementRef = { current: mockElement }

        ;(html2canvas as unknown as jest.Mock).mockRejectedValueOnce(
            'string error',
        )

        await act(async () => {
            await result.current.exportToPDF(elementRef)
        })

        expect(result.current.isError).toBe(true)
        expect(result.current.error?.message).toBe('Failed to export PDF')
    })

    it('should hide button groups in cloned document during export', async () => {
        const { result } = renderHook(() => useExportDashboardToPDF())

        const buttonGroup = document.createElement('div')
        buttonGroup.className = 'buttongroup-group-test'
        buttonGroup.style.display = 'flex'
        mockElement.appendChild(buttonGroup)

        const elementRef = { current: mockElement }

        let clonedButtonGroupDisplay: string | undefined
        ;(html2canvas as unknown as jest.Mock).mockImplementationOnce(
            async (
                _element: HTMLElement,
                options: { onclone?: (doc: Document) => Promise<void> },
            ) => {
                const clonedDoc = document.implementation.createHTMLDocument()
                const clonedElement = mockElement.cloneNode(true) as HTMLElement
                clonedDoc.body.appendChild(clonedElement)

                if (options.onclone) {
                    await options.onclone(clonedDoc)
                }

                const clonedButtonGroup = clonedDoc.body.querySelector(
                    '[class*="buttongroup-group"]',
                ) as HTMLElement
                clonedButtonGroupDisplay = clonedButtonGroup?.style.display

                return mockCanvas
            },
        )

        await act(async () => {
            await result.current.exportToPDF(elementRef)
        })

        expect(clonedButtonGroupDisplay).toBe('none')
        expect(buttonGroup.style.display).toBe('flex')
    })

    it('should inline SVG use elements in cloned document during export', async () => {
        const { result } = renderHook(() => useExportDashboardToPDF())

        const symbol = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'symbol',
        )
        symbol.id = 'test-icon'
        symbol.setAttribute('viewBox', '0 0 24 24')
        const path = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'path',
        )
        path.setAttribute('d', 'M0 0h24v24H0z')
        symbol.appendChild(path)
        document.body.appendChild(symbol)

        const svg = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'svg',
        )
        const use = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'use',
        )
        use.setAttribute('href', '#test-icon')
        svg.appendChild(use)
        mockElement.appendChild(svg)

        const elementRef = { current: mockElement }

        let clonedSvgContent: string | undefined
        ;(html2canvas as unknown as jest.Mock).mockImplementationOnce(
            async (
                _element: HTMLElement,
                options: { onclone?: (doc: Document) => Promise<void> },
            ) => {
                const clonedDoc = document.implementation.createHTMLDocument()
                const clonedElement = mockElement.cloneNode(true) as HTMLElement
                clonedDoc.body.appendChild(clonedElement)

                if (options.onclone) {
                    await options.onclone(clonedDoc)
                }

                const clonedSvg = clonedDoc.body.querySelector('svg')
                clonedSvgContent = clonedSvg?.innerHTML

                return mockCanvas
            },
        )

        await act(async () => {
            await result.current.exportToPDF(elementRef)
        })

        expect(clonedSvgContent).toContain('path')
        expect(svg.querySelector('use')).not.toBeNull()

        document.body.removeChild(symbol)
    })

    it('should handle SVG use elements with xlink:href', async () => {
        const { result } = renderHook(() => useExportDashboardToPDF())

        const symbol = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'symbol',
        )
        symbol.id = 'xlink-icon'
        symbol.setAttribute('viewBox', '0 0 16 16')
        const rect = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'rect',
        )
        rect.setAttribute('width', '16')
        rect.setAttribute('height', '16')
        symbol.appendChild(rect)
        document.body.appendChild(symbol)

        const svg = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'svg',
        )
        const use = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'use',
        )
        use.setAttribute('xlink:href', '#xlink-icon')
        svg.appendChild(use)
        mockElement.appendChild(svg)

        const elementRef = { current: mockElement }

        await act(async () => {
            await result.current.exportToPDF(elementRef)
        })

        expect(result.current.isSuccess).toBe(true)

        document.body.removeChild(symbol)
    })

    it('should set viewBox from symbol when SVG has no viewBox in cloned document', async () => {
        const { result } = renderHook(() => useExportDashboardToPDF())

        const symbol = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'symbol',
        )
        symbol.id = 'viewbox-icon'
        symbol.setAttribute('viewBox', '0 0 32 32')
        symbol.appendChild(
            document.createElementNS('http://www.w3.org/2000/svg', 'circle'),
        )
        document.body.appendChild(symbol)

        const svg = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'svg',
        )
        const use = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'use',
        )
        use.setAttribute('href', '#viewbox-icon')
        svg.appendChild(use)
        mockElement.appendChild(svg)

        const elementRef = { current: mockElement }

        let clonedViewBox: string | null = null

        ;(html2canvas as unknown as jest.Mock).mockImplementationOnce(
            async (
                _element: HTMLElement,
                options: { onclone?: (doc: Document) => Promise<void> },
            ) => {
                const clonedDoc = document.implementation.createHTMLDocument()
                const clonedElement = mockElement.cloneNode(true) as HTMLElement
                clonedDoc.body.appendChild(clonedElement)

                if (options.onclone) {
                    await options.onclone(clonedDoc)
                }

                const clonedSvg = clonedDoc.body.querySelector('svg')
                clonedViewBox = clonedSvg?.getAttribute('viewBox') ?? null

                return mockCanvas
            },
        )

        await act(async () => {
            await result.current.exportToPDF(elementRef)
        })

        expect(clonedViewBox).toBe('0 0 32 32')
        expect(svg.getAttribute('viewBox')).toBeNull()

        document.body.removeChild(symbol)
    })

    it('should handle SVG use elements without href', async () => {
        const { result } = renderHook(() => useExportDashboardToPDF())

        const svg = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'svg',
        )
        const use = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'use',
        )
        svg.appendChild(use)
        mockElement.appendChild(svg)

        const elementRef = { current: mockElement }

        await act(async () => {
            await result.current.exportToPDF(elementRef)
        })

        expect(result.current.isSuccess).toBe(true)
    })

    it('should handle SVG use elements with non-existent symbol', async () => {
        const { result } = renderHook(() => useExportDashboardToPDF())

        const svg = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'svg',
        )
        const use = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'use',
        )
        use.setAttribute('href', '#non-existent-icon')
        svg.appendChild(use)
        mockElement.appendChild(svg)

        const elementRef = { current: mockElement }

        await act(async () => {
            await result.current.exportToPDF(elementRef)
        })

        expect(result.current.isSuccess).toBe(true)
    })

    it('should handle external SVG sprite references', async () => {
        const { result } = renderHook(() => useExportDashboardToPDF())

        const mockSvgSprite = `
            <svg xmlns="http://www.w3.org/2000/svg">
                <symbol id="external-icon" viewBox="0 0 24 24">
                    <path d="M12 0L24 24H0z"/>
                </symbol>
            </svg>
        `
        global.fetch = jest.fn().mockResolvedValue({
            text: () => Promise.resolve(mockSvgSprite),
        })

        const svg = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'svg',
        )
        const use = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'use',
        )
        use.setAttribute('href', '/sprites.svg#external-icon')
        svg.appendChild(use)
        mockElement.appendChild(svg)

        const elementRef = { current: mockElement }

        ;(html2canvas as unknown as jest.Mock).mockImplementationOnce(
            async (
                _element: HTMLElement,
                options: { onclone?: (doc: Document) => Promise<void> },
            ) => {
                const clonedDoc = document.implementation.createHTMLDocument()
                const clonedElement = mockElement.cloneNode(true) as HTMLElement
                clonedDoc.body.appendChild(clonedElement)

                if (options.onclone) {
                    await options.onclone(clonedDoc)
                }

                return mockCanvas
            },
        )

        await act(async () => {
            await result.current.exportToPDF(elementRef)
        })

        expect(global.fetch).toHaveBeenCalledWith('/sprites.svg')
        expect(result.current.isSuccess).toBe(true)
    })

    it('should cache external SVG sprite fetches', async () => {
        const { result } = renderHook(() => useExportDashboardToPDF())

        const mockSvgSprite = `
            <svg xmlns="http://www.w3.org/2000/svg">
                <symbol id="icon1" viewBox="0 0 24 24"><path/></symbol>
                <symbol id="icon2" viewBox="0 0 24 24"><rect/></symbol>
            </svg>
        `
        global.fetch = jest.fn().mockResolvedValue({
            text: () => Promise.resolve(mockSvgSprite),
        })

        const svg1 = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'svg',
        )
        const use1 = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'use',
        )
        use1.setAttribute('href', '/cached-sprites.svg#icon1')
        svg1.appendChild(use1)
        mockElement.appendChild(svg1)

        const svg2 = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'svg',
        )
        const use2 = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'use',
        )
        use2.setAttribute('href', '/cached-sprites.svg#icon2')
        svg2.appendChild(use2)
        mockElement.appendChild(svg2)

        const elementRef = { current: mockElement }

        ;(html2canvas as unknown as jest.Mock).mockImplementationOnce(
            async (
                _element: HTMLElement,
                options: { onclone?: (doc: Document) => Promise<void> },
            ) => {
                const clonedDoc = document.implementation.createHTMLDocument()
                const clonedElement = mockElement.cloneNode(true) as HTMLElement
                clonedDoc.body.appendChild(clonedElement)

                if (options.onclone) {
                    await options.onclone(clonedDoc)
                }

                return mockCanvas
            },
        )

        await act(async () => {
            await result.current.exportToPDF(elementRef)
        })

        expect(global.fetch).toHaveBeenCalledTimes(1)
    })

    it('should handle fetch failure for external SVG sprites', async () => {
        const { result } = renderHook(() => useExportDashboardToPDF())

        global.fetch = jest.fn().mockRejectedValue(new Error('Network error'))

        const svg = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'svg',
        )
        const use = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'use',
        )
        use.setAttribute('href', '/failing-sprites.svg#icon')
        svg.appendChild(use)
        mockElement.appendChild(svg)

        const elementRef = { current: mockElement }

        await act(async () => {
            await result.current.exportToPDF(elementRef)
        })

        expect(result.current.isSuccess).toBe(true)
    })

    it('should restore multiple button groups after export', async () => {
        const { result } = renderHook(() => useExportDashboardToPDF())

        const buttonGroup1 = document.createElement('div')
        buttonGroup1.className = 'buttongroup-group-1'
        buttonGroup1.style.display = 'flex'
        mockElement.appendChild(buttonGroup1)

        const buttonGroup2 = document.createElement('div')
        buttonGroup2.className = 'buttongroup-group-2'
        buttonGroup2.style.display = 'inline-flex'
        mockElement.appendChild(buttonGroup2)

        const elementRef = { current: mockElement }

        await act(async () => {
            await result.current.exportToPDF(elementRef)
        })

        expect(buttonGroup1.style.display).toBe('flex')
        expect(buttonGroup2.style.display).toBe('inline-flex')
    })

    it('should handle use element without SVG parent', async () => {
        const { result } = renderHook(() => useExportDashboardToPDF())

        const div = document.createElement('div')
        const use = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'use',
        )
        use.setAttribute('href', '#test-icon')
        div.appendChild(use)
        mockElement.appendChild(div)

        const elementRef = { current: mockElement }

        await act(async () => {
            await result.current.exportToPDF(elementRef)
        })

        expect(result.current.isSuccess).toBe(true)
    })
})
