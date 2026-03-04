import { act, renderHook } from '@testing-library/react'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import moment from 'moment'

import { useExportDashboardToPDF } from '../useExportDashboardToPDF'

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
            addPage: jest.fn(),
            save: jest.fn(),
        } as unknown as jest.Mocked<jsPDF>
        ;(jsPDF as unknown as jest.Mock).mockImplementation(() => mockPDF)
        ;(html2canvas as unknown as jest.Mock).mockResolvedValue(mockCanvas)
        ;(moment as unknown as jest.Mock).mockReturnValue({
            format: jest.fn().mockReturnValue('2024-01-15'),
        })

        mockElement = document.createElement('div')
        mockElement.scrollIntoView = jest.fn()
        Object.defineProperty(mockElement, 'scrollWidth', { value: 1920 })
        Object.defineProperty(mockElement, 'scrollHeight', { value: 1080 })

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

    it('should call html2canvas with correct options including scroll dimensions', async () => {
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
            windowWidth: 1920,
            windowHeight: 1080,
            width: 1920,
            height: 1080,
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

    it('should fit tall content on single page by scaling down', async () => {
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

        expect(mockPDF.addPage).not.toHaveBeenCalled()
        expect(mockPDF.addImage).toHaveBeenCalledTimes(1)

        const call = (mockPDF.addImage as jest.Mock).mock.calls[0]
        const imgHeight = call[5]
        const availableHeight = 297 - 10 * 2
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
                options: {
                    onclone?: (
                        doc: Document,
                        element: HTMLElement,
                    ) => Promise<void>
                },
            ) => {
                const clonedDoc = document.implementation.createHTMLDocument()
                const clonedElement = mockElement.cloneNode(true) as HTMLElement
                clonedDoc.body.appendChild(clonedElement)

                if (options.onclone) {
                    await options.onclone(clonedDoc, clonedElement)
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
                options: {
                    onclone?: (
                        doc: Document,
                        element: HTMLElement,
                    ) => Promise<void>
                },
            ) => {
                const clonedDoc = document.implementation.createHTMLDocument()
                const clonedElement = mockElement.cloneNode(true) as HTMLElement
                clonedDoc.body.appendChild(clonedElement)

                if (options.onclone) {
                    await options.onclone(clonedDoc, clonedElement)
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
                options: {
                    onclone?: (
                        doc: Document,
                        element: HTMLElement,
                    ) => Promise<void>
                },
            ) => {
                const clonedDoc = document.implementation.createHTMLDocument()
                const clonedElement = mockElement.cloneNode(true) as HTMLElement
                clonedDoc.body.appendChild(clonedElement)

                if (options.onclone) {
                    await options.onclone(clonedDoc, clonedElement)
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
                options: {
                    onclone?: (
                        doc: Document,
                        element: HTMLElement,
                    ) => Promise<void>
                },
            ) => {
                const clonedDoc = document.implementation.createHTMLDocument()
                const clonedElement = mockElement.cloneNode(true) as HTMLElement
                clonedDoc.body.appendChild(clonedElement)

                if (options.onclone) {
                    await options.onclone(clonedDoc, clonedElement)
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
                options: {
                    onclone?: (
                        doc: Document,
                        element: HTMLElement,
                    ) => Promise<void>
                },
            ) => {
                const clonedDoc = document.implementation.createHTMLDocument()
                const clonedElement = mockElement.cloneNode(true) as HTMLElement
                clonedDoc.body.appendChild(clonedElement)

                if (options.onclone) {
                    await options.onclone(clonedDoc, clonedElement)
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

    describe('Width expansion', () => {
        it('should use MIN_CAPTURE_WIDTH when element scrollWidth is smaller than 1200px', async () => {
            const { result } = renderHook(() => useExportDashboardToPDF())

            const smallElement = document.createElement('div')
            Object.defineProperty(smallElement, 'scrollWidth', { value: 800 })
            Object.defineProperty(smallElement, 'scrollHeight', {
                value: 600,
            })
            smallElement.scrollIntoView = jest.fn()

            const elementRef = { current: smallElement }

            await act(async () => {
                await result.current.exportToPDF(elementRef)
            })

            expect(html2canvas).toHaveBeenCalledWith(
                smallElement,
                expect.objectContaining({
                    width: 1200,
                    windowWidth: 1200,
                }),
            )
        })

        it('should expand containers with class containing "container" in cloned document', async () => {
            const { result } = renderHook(() => useExportDashboardToPDF())

            const container = document.createElement('div')
            container.className = 'main-container'
            container.style.maxWidth = '1000px'
            container.style.overflow = 'hidden'
            mockElement.appendChild(container)

            const elementRef = { current: mockElement }

            let clonedContainerStyles: CSSStyleDeclaration | undefined
            ;(html2canvas as unknown as jest.Mock).mockImplementationOnce(
                async (
                    _element: HTMLElement,
                    options: {
                        onclone?: (
                            doc: Document,
                            element: HTMLElement,
                        ) => Promise<void>
                    },
                ) => {
                    const clonedDoc =
                        document.implementation.createHTMLDocument()
                    const clonedElement = mockElement.cloneNode(
                        true,
                    ) as HTMLElement
                    clonedDoc.body.appendChild(clonedElement)

                    if (options.onclone) {
                        await options.onclone(clonedDoc, clonedElement)
                    }

                    const clonedContainer = clonedDoc.body.querySelector(
                        '[class*="container"]',
                    ) as HTMLElement
                    clonedContainerStyles = clonedContainer?.style

                    return mockCanvas
                },
            )

            await act(async () => {
                await result.current.exportToPDF(elementRef)
            })

            expect(clonedContainerStyles?.maxWidth).toBe('none')
            expect(clonedContainerStyles?.overflow).toBe('visible')
            expect(container.style.maxWidth).toBe('1000px')
        })

        it('should expand containers with class containing "kpisSection" in cloned document', async () => {
            const { result } = renderHook(() => useExportDashboardToPDF())

            const kpiSection = document.createElement('div')
            kpiSection.className = 'dashboard-kpisSection-wrapper'
            kpiSection.style.maxWidth = '800px'
            mockElement.appendChild(kpiSection)

            const elementRef = { current: mockElement }

            let clonedKpiStyles: CSSStyleDeclaration | undefined
            ;(html2canvas as unknown as jest.Mock).mockImplementationOnce(
                async (
                    _element: HTMLElement,
                    options: {
                        onclone?: (
                            doc: Document,
                            element: HTMLElement,
                        ) => Promise<void>
                    },
                ) => {
                    const clonedDoc =
                        document.implementation.createHTMLDocument()
                    const clonedElement = mockElement.cloneNode(
                        true,
                    ) as HTMLElement
                    clonedDoc.body.appendChild(clonedElement)

                    if (options.onclone) {
                        await options.onclone(clonedDoc, clonedElement)
                    }

                    const clonedKpi = clonedDoc.body.querySelector(
                        '[class*="kpisSection"]',
                    ) as HTMLElement
                    clonedKpiStyles = clonedKpi?.style

                    return mockCanvas
                },
            )

            await act(async () => {
                await result.current.exportToPDF(elementRef)
            })

            expect(clonedKpiStyles?.maxWidth).toBe('none')
            expect(clonedKpiStyles?.overflow).toBe('visible')
        })

        it('should handle no matching containers gracefully', async () => {
            const { result } = renderHook(() => useExportDashboardToPDF())

            const simpleDiv = document.createElement('div')
            simpleDiv.className = 'simple-div'
            mockElement.appendChild(simpleDiv)

            const elementRef = { current: mockElement }

            await act(async () => {
                await result.current.exportToPDF(elementRef)
            })

            expect(result.current.isSuccess).toBe(true)
        })
    })

    describe('Sticky positioning removal', () => {
        it('should not affect original element sticky positioning', async () => {
            const { result } = renderHook(() => useExportDashboardToPDF())

            const stickyNav = document.createElement('nav')
            stickyNav.className = 'navigation-stickyHeader'
            stickyNav.style.position = 'sticky'
            stickyNav.style.top = '0'
            mockElement.appendChild(stickyNav)

            const elementRef = { current: mockElement }

            await act(async () => {
                await result.current.exportToPDF(elementRef)
            })

            expect(stickyNav.style.position).toBe('sticky')
            expect(stickyNav.style.top).toBe('0px')
        })
    })

    describe('Image scaling and positioning', () => {
        it('should center image horizontally when width is less than available width', async () => {
            const { result } = renderHook(() => useExportDashboardToPDF())

            const narrowCanvas = document.createElement('canvas')
            narrowCanvas.width = 800
            narrowCanvas.height = 600
            narrowCanvas.toDataURL = jest
                .fn()
                .mockReturnValue('data:image/png;base64,mock')
            ;(html2canvas as unknown as jest.Mock).mockResolvedValueOnce(
                narrowCanvas,
            )

            const elementRef = { current: mockElement }

            await act(async () => {
                await result.current.exportToPDF(elementRef)
            })

            const addImageCall = (mockPDF.addImage as jest.Mock).mock.calls[0]
            const xOffset = addImageCall[2]
            expect(xOffset).toBeGreaterThan(10)
        })

        it('should center image vertically when height is less than available height', async () => {
            const { result } = renderHook(() => useExportDashboardToPDF())

            const shortCanvas = document.createElement('canvas')
            shortCanvas.width = 1200
            shortCanvas.height = 100
            shortCanvas.toDataURL = jest
                .fn()
                .mockReturnValue('data:image/png;base64,mock')
            ;(html2canvas as unknown as jest.Mock).mockResolvedValueOnce(
                shortCanvas,
            )

            const elementRef = { current: mockElement }

            await act(async () => {
                await result.current.exportToPDF(elementRef)
            })

            const addImageCall = (mockPDF.addImage as jest.Mock).mock.calls[0]
            const yOffset = addImageCall[3]
            expect(yOffset).toBeGreaterThan(10)
        })

        it('should handle square canvas with 1:1 aspect ratio', async () => {
            const { result } = renderHook(() => useExportDashboardToPDF())

            const squareCanvas = document.createElement('canvas')
            squareCanvas.width = 1200
            squareCanvas.height = 1200
            squareCanvas.toDataURL = jest
                .fn()
                .mockReturnValue('data:image/png;base64,mock')
            ;(html2canvas as unknown as jest.Mock).mockResolvedValueOnce(
                squareCanvas,
            )

            const elementRef = { current: mockElement }

            await act(async () => {
                await result.current.exportToPDF(elementRef)
            })

            const addImageCall = (mockPDF.addImage as jest.Mock).mock.calls[0]
            const imgWidth = addImageCall[4]
            const imgHeight = addImageCall[5]
            expect(imgWidth).toBe(imgHeight)
        })

        it('should scale down canvas wider than PDF available width', async () => {
            const { result } = renderHook(() => useExportDashboardToPDF())

            const wideCanvas = document.createElement('canvas')
            wideCanvas.width = 3000
            wideCanvas.height = 1000
            wideCanvas.toDataURL = jest
                .fn()
                .mockReturnValue('data:image/png;base64,mock')
            ;(html2canvas as unknown as jest.Mock).mockResolvedValueOnce(
                wideCanvas,
            )

            const elementRef = { current: mockElement }

            await act(async () => {
                await result.current.exportToPDF(elementRef)
            })

            const addImageCall = (mockPDF.addImage as jest.Mock).mock.calls[0]
            const imgWidth = addImageCall[4]
            const availableWidth = 297 - 10 * 2
            expect(imgWidth).toBeLessThanOrEqual(availableWidth)
        })

        it('should use image quality 1.0 when converting canvas to data URL', async () => {
            const { result } = renderHook(() => useExportDashboardToPDF())

            const toDataURLSpy = jest
                .fn()
                .mockReturnValue('data:image/png;base64,mock')
            const testCanvas = document.createElement('canvas')
            testCanvas.width = 1920
            testCanvas.height = 1080
            testCanvas.toDataURL = toDataURLSpy
            ;(html2canvas as unknown as jest.Mock).mockResolvedValueOnce(
                testCanvas,
            )

            const elementRef = { current: mockElement }

            await act(async () => {
                await result.current.exportToPDF(elementRef)
            })

            expect(toDataURLSpy).toHaveBeenCalledWith('image/png', 1.0)
        })
    })

    describe('PDF dimensions and layout', () => {
        it('should create PDF with correct landscape dimensions', async () => {
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

        it('should calculate available width with 10mm margins', async () => {
            const { result } = renderHook(() => useExportDashboardToPDF())
            const elementRef = { current: mockElement }

            await act(async () => {
                await result.current.exportToPDF(elementRef)
            })

            const addImageCall = (mockPDF.addImage as jest.Mock).mock.calls[0]
            const imgWidth = addImageCall[4]
            const maxWidth = 297 - 10 * 2
            expect(imgWidth).toBeLessThanOrEqual(maxWidth)
        })

        it('should calculate available height with 10mm margins', async () => {
            const { result } = renderHook(() => useExportDashboardToPDF())
            const elementRef = { current: mockElement }

            const tallCanvas = document.createElement('canvas')
            tallCanvas.width = 800
            tallCanvas.height = 3000
            tallCanvas.toDataURL = jest
                .fn()
                .mockReturnValue('data:image/png;base64,mock')
            ;(html2canvas as unknown as jest.Mock).mockResolvedValueOnce(
                tallCanvas,
            )

            await act(async () => {
                await result.current.exportToPDF(elementRef)
            })

            const addImageCall = (mockPDF.addImage as jest.Mock).mock.calls[0]
            const imgHeight = addImageCall[5]
            const maxHeight = 210 - 10 * 2
            expect(imgHeight).toBeLessThanOrEqual(maxHeight)
        })

        it('should use PNG format and FAST compression for image', async () => {
            const { result } = renderHook(() => useExportDashboardToPDF())
            const elementRef = { current: mockElement }

            await act(async () => {
                await result.current.exportToPDF(elementRef)
            })

            expect(mockPDF.addImage).toHaveBeenCalledWith(
                expect.any(String),
                'PNG',
                expect.any(Number),
                expect.any(Number),
                expect.any(Number),
                expect.any(Number),
                undefined,
                'FAST',
            )
        })
    })

    describe('SVG viewBox handling', () => {
        it('should not override existing viewBox on SVG element', async () => {
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
            symbol.appendChild(path)
            document.body.appendChild(symbol)

            const svg = document.createElementNS(
                'http://www.w3.org/2000/svg',
                'svg',
            )
            svg.setAttribute('viewBox', '0 0 100 100')
            const use = document.createElementNS(
                'http://www.w3.org/2000/svg',
                'use',
            )
            use.setAttribute('href', '#test-icon')
            svg.appendChild(use)
            mockElement.appendChild(svg)

            const elementRef = { current: mockElement }

            let clonedSvgViewBox: string | null | undefined = null
            ;(html2canvas as unknown as jest.Mock).mockImplementationOnce(
                async (
                    _element: HTMLElement,
                    options: {
                        onclone?: (
                            doc: Document,
                            element: HTMLElement,
                        ) => Promise<void>
                    },
                ) => {
                    const clonedDoc =
                        document.implementation.createHTMLDocument()
                    const clonedElement = mockElement.cloneNode(
                        true,
                    ) as HTMLElement
                    clonedDoc.body.appendChild(clonedElement)

                    if (options.onclone) {
                        await options.onclone(clonedDoc, clonedElement)
                    }

                    const clonedSvg = clonedDoc.body.querySelector('svg')
                    clonedSvgViewBox = clonedSvg?.getAttribute('viewBox')

                    return mockCanvas
                },
            )

            await act(async () => {
                await result.current.exportToPDF(elementRef)
            })

            expect(clonedSvgViewBox).toBe('0 0 100 100')

            document.body.removeChild(symbol)
        })

        it('should handle symbol without viewBox attribute', async () => {
            const { result } = renderHook(() => useExportDashboardToPDF())

            const symbol = document.createElementNS(
                'http://www.w3.org/2000/svg',
                'symbol',
            )
            symbol.id = 'no-viewbox-icon'
            const circle = document.createElementNS(
                'http://www.w3.org/2000/svg',
                'circle',
            )
            symbol.appendChild(circle)
            document.body.appendChild(symbol)

            const svg = document.createElementNS(
                'http://www.w3.org/2000/svg',
                'svg',
            )
            const use = document.createElementNS(
                'http://www.w3.org/2000/svg',
                'use',
            )
            use.setAttribute('href', '#no-viewbox-icon')
            svg.appendChild(use)
            mockElement.appendChild(svg)

            const elementRef = { current: mockElement }

            await act(async () => {
                await result.current.exportToPDF(elementRef)
            })

            expect(result.current.isSuccess).toBe(true)

            document.body.removeChild(symbol)
        })

        it('should handle empty viewBox value gracefully', async () => {
            const { result } = renderHook(() => useExportDashboardToPDF())

            const symbol = document.createElementNS(
                'http://www.w3.org/2000/svg',
                'symbol',
            )
            symbol.id = 'empty-viewbox'
            symbol.setAttribute('viewBox', '')
            const rect = document.createElementNS(
                'http://www.w3.org/2000/svg',
                'rect',
            )
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
            use.setAttribute('href', '#empty-viewbox')
            svg.appendChild(use)
            mockElement.appendChild(svg)

            const elementRef = { current: mockElement }

            await act(async () => {
                await result.current.exportToPDF(elementRef)
            })

            expect(result.current.isSuccess).toBe(true)

            document.body.removeChild(symbol)
        })

        it('should inherit viewBox from symbol with nested SVG elements', async () => {
            const { result } = renderHook(() => useExportDashboardToPDF())

            const symbol = document.createElementNS(
                'http://www.w3.org/2000/svg',
                'symbol',
            )
            symbol.id = 'nested-icon'
            symbol.setAttribute('viewBox', '0 0 48 48')
            const g = document.createElementNS(
                'http://www.w3.org/2000/svg',
                'g',
            )
            const path = document.createElementNS(
                'http://www.w3.org/2000/svg',
                'path',
            )
            g.appendChild(path)
            symbol.appendChild(g)
            document.body.appendChild(symbol)

            const svg = document.createElementNS(
                'http://www.w3.org/2000/svg',
                'svg',
            )
            const use = document.createElementNS(
                'http://www.w3.org/2000/svg',
                'use',
            )
            use.setAttribute('href', '#nested-icon')
            svg.appendChild(use)
            mockElement.appendChild(svg)

            const elementRef = { current: mockElement }

            let clonedSvgViewBox: string | null | undefined = null
            ;(html2canvas as unknown as jest.Mock).mockImplementationOnce(
                async (
                    _element: HTMLElement,
                    options: {
                        onclone?: (
                            doc: Document,
                            element: HTMLElement,
                        ) => Promise<void>
                    },
                ) => {
                    const clonedDoc =
                        document.implementation.createHTMLDocument()
                    const clonedElement = mockElement.cloneNode(
                        true,
                    ) as HTMLElement
                    clonedDoc.body.appendChild(clonedElement)

                    if (options.onclone) {
                        await options.onclone(clonedDoc, clonedElement)
                    }

                    const clonedSvg = clonedDoc.body.querySelector('svg')
                    clonedSvgViewBox = clonedSvg?.getAttribute('viewBox')

                    return mockCanvas
                },
            )

            await act(async () => {
                await result.current.exportToPDF(elementRef)
            })

            expect(clonedSvgViewBox).toBe('0 0 48 48')

            document.body.removeChild(symbol)
        })
    })

    describe('State transitions', () => {
        it('should clear error when starting new export after previous error', async () => {
            const { result } = renderHook(() => useExportDashboardToPDF())
            const elementRef = { current: mockElement }

            ;(html2canvas as unknown as jest.Mock).mockRejectedValueOnce(
                new Error('First error'),
            )

            await act(async () => {
                await result.current.exportToPDF(elementRef)
            })

            expect(result.current.error?.message).toBe('First error')
            ;(html2canvas as unknown as jest.Mock).mockResolvedValueOnce(
                mockCanvas,
            )

            await act(async () => {
                await result.current.exportToPDF(elementRef)
            })

            expect(result.current.error).toBeNull()
            expect(result.current.isSuccess).toBe(true)
        })

        it('should maintain error null during success state', async () => {
            const { result } = renderHook(() => useExportDashboardToPDF())
            const elementRef = { current: mockElement }

            await act(async () => {
                await result.current.exportToPDF(elementRef)
            })

            expect(result.current.isSuccess).toBe(true)
            expect(result.current.error).toBeNull()
        })

        it('should maintain error null during loading state', async () => {
            jest.useFakeTimers()
            const { result } = renderHook(() => useExportDashboardToPDF())
            const elementRef = { current: mockElement }

            let loadingError: Error | null = null

            act(() => {
                result.current.exportToPDF(elementRef).then(() => {})
            })

            await act(async () => {
                await jest.advanceTimersByTimeAsync(50)
            })

            if (result.current.isLoading) {
                loadingError = result.current.error
            }

            await act(async () => {
                await jest.advanceTimersByTimeAsync(100)
            })

            expect(loadingError).toBeNull()

            jest.useRealTimers()
        })

        it('should handle consecutive export attempts', async () => {
            jest.useFakeTimers()
            const { result } = renderHook(() => useExportDashboardToPDF())
            const elementRef = { current: mockElement }

            await act(async () => {
                const firstExport = result.current.exportToPDF(elementRef)
                await jest.advanceTimersByTimeAsync(100)
                await firstExport
            })

            expect(result.current.isSuccess).toBe(true)

            await act(async () => {
                const secondExport = result.current.exportToPDF(elementRef)
                await jest.advanceTimersByTimeAsync(100)
                await secondExport
            })

            expect(result.current.isSuccess).toBe(true)
            expect(mockPDF.save).toHaveBeenCalledTimes(2)

            jest.useRealTimers()
        })
    })

    describe('Interactive elements hiding', () => {
        it('should hide elements with data-pdf-exclude attribute in cloned document', async () => {
            const { result } = renderHook(() => useExportDashboardToPDF())

            const excludedElement = document.createElement('div')
            excludedElement.setAttribute('data-pdf-exclude', 'true')
            excludedElement.style.display = 'block'
            mockElement.appendChild(excludedElement)

            const elementRef = { current: mockElement }

            let clonedExcludedDisplay: string | undefined
            ;(html2canvas as unknown as jest.Mock).mockImplementationOnce(
                async (
                    _element: HTMLElement,
                    options: {
                        onclone?: (
                            doc: Document,
                            element: HTMLElement,
                        ) => Promise<void>
                    },
                ) => {
                    const clonedDoc =
                        document.implementation.createHTMLDocument()
                    const clonedElement = mockElement.cloneNode(
                        true,
                    ) as HTMLElement
                    clonedDoc.body.appendChild(clonedElement)

                    if (options.onclone) {
                        await options.onclone(clonedDoc, clonedElement)
                    }

                    const clonedExcluded = clonedDoc.body.querySelector(
                        '[data-pdf-exclude]',
                    ) as HTMLElement
                    clonedExcludedDisplay = clonedExcluded?.style.display

                    return mockCanvas
                },
            )

            await act(async () => {
                await result.current.exportToPDF(elementRef)
            })

            expect(clonedExcludedDisplay).toBe('none')
            expect(excludedElement.style.display).toBe('block')
        })

        it('should handle mixed button groups and pdf-exclude elements', async () => {
            const { result } = renderHook(() => useExportDashboardToPDF())

            const buttonGroup = document.createElement('div')
            buttonGroup.className = 'buttongroup-group-actions'
            buttonGroup.style.display = 'flex'
            mockElement.appendChild(buttonGroup)

            const excludedDiv = document.createElement('div')
            excludedDiv.setAttribute('data-pdf-exclude', 'true')
            excludedDiv.style.display = 'grid'
            mockElement.appendChild(excludedDiv)

            const elementRef = { current: mockElement }

            await act(async () => {
                await result.current.exportToPDF(elementRef)
            })

            expect(buttonGroup.style.display).toBe('flex')
            expect(excludedDiv.style.display).toBe('grid')
        })

        it('should preserve elements with display none originally', async () => {
            const { result } = renderHook(() => useExportDashboardToPDF())

            const hiddenButton = document.createElement('div')
            hiddenButton.className = 'buttongroup-group-hidden'
            hiddenButton.style.display = 'none'
            mockElement.appendChild(hiddenButton)

            const elementRef = { current: mockElement }

            await act(async () => {
                await result.current.exportToPDF(elementRef)
            })

            expect(hiddenButton.style.display).toBe('none')
        })

        it('should restore various display values correctly', async () => {
            const { result } = renderHook(() => useExportDashboardToPDF())

            const gridGroup = document.createElement('div')
            gridGroup.className = 'buttongroup-group-grid'
            gridGroup.style.display = 'grid'
            mockElement.appendChild(gridGroup)

            const inlineGroup = document.createElement('div')
            inlineGroup.className = 'buttongroup-group-inline'
            inlineGroup.style.display = 'inline-block'
            mockElement.appendChild(inlineGroup)

            const elementRef = { current: mockElement }

            await act(async () => {
                await result.current.exportToPDF(elementRef)
            })

            expect(gridGroup.style.display).toBe('grid')
            expect(inlineGroup.style.display).toBe('inline-block')
        })
    })

    describe('Canvas dimension calculations', () => {
        it('should use scrollWidth for width calculation', async () => {
            const { result } = renderHook(() => useExportDashboardToPDF())

            const elementWithScroll = document.createElement('div')
            Object.defineProperty(elementWithScroll, 'scrollWidth', {
                value: 2000,
            })
            Object.defineProperty(elementWithScroll, 'scrollHeight', {
                value: 1500,
            })
            Object.defineProperty(elementWithScroll, 'clientWidth', {
                value: 1500,
            })
            elementWithScroll.scrollIntoView = jest.fn()

            const elementRef = { current: elementWithScroll }

            await act(async () => {
                await result.current.exportToPDF(elementRef)
            })

            expect(html2canvas).toHaveBeenCalledWith(
                elementWithScroll,
                expect.objectContaining({
                    width: 2000,
                    windowWidth: 2000,
                }),
            )
        })

        it('should use scrollHeight for height calculation', async () => {
            const { result } = renderHook(() => useExportDashboardToPDF())

            const elementWithScroll = document.createElement('div')
            Object.defineProperty(elementWithScroll, 'scrollWidth', {
                value: 1920,
            })
            Object.defineProperty(elementWithScroll, 'scrollHeight', {
                value: 2500,
            })
            Object.defineProperty(elementWithScroll, 'clientHeight', {
                value: 1500,
            })
            elementWithScroll.scrollIntoView = jest.fn()

            const elementRef = { current: elementWithScroll }

            await act(async () => {
                await result.current.exportToPDF(elementRef)
            })

            expect(html2canvas).toHaveBeenCalledWith(
                elementWithScroll,
                expect.objectContaining({
                    height: 2500,
                    windowHeight: 2500,
                }),
            )
        })

        it('should apply Math.max with MIN_CAPTURE_WIDTH for width', async () => {
            const { result } = renderHook(() => useExportDashboardToPDF())

            const narrowElement = document.createElement('div')
            Object.defineProperty(narrowElement, 'scrollWidth', { value: 500 })
            Object.defineProperty(narrowElement, 'scrollHeight', {
                value: 1000,
            })
            narrowElement.scrollIntoView = jest.fn()

            const elementRef = { current: narrowElement }

            await act(async () => {
                await result.current.exportToPDF(elementRef)
            })

            expect(html2canvas).toHaveBeenCalledWith(
                narrowElement,
                expect.objectContaining({
                    width: 1200,
                    windowWidth: 1200,
                }),
            )
        })

        it('should pass all dimension parameters to html2canvas', async () => {
            const { result } = renderHook(() => useExportDashboardToPDF())
            const elementRef = { current: mockElement }

            await act(async () => {
                await result.current.exportToPDF(elementRef)
            })

            expect(html2canvas).toHaveBeenCalledWith(
                mockElement,
                expect.objectContaining({
                    width: expect.any(Number),
                    height: expect.any(Number),
                    windowWidth: expect.any(Number),
                    windowHeight: expect.any(Number),
                }),
            )
        })
    })

    describe('Theme enforcement', () => {
        it('should remove dark and classic theme classes and add light class in cloned document', async () => {
            const { result } = renderHook(() => useExportDashboardToPDF())
            const elementRef = { current: mockElement }

            let clonedBodyClasses: string[] = []
            ;(html2canvas as unknown as jest.Mock).mockImplementationOnce(
                async (
                    _element: HTMLElement,
                    options: {
                        onclone?: (
                            doc: Document,
                            element: HTMLElement,
                        ) => Promise<void>
                    },
                ) => {
                    const clonedDoc =
                        document.implementation.createHTMLDocument()
                    clonedDoc.body.className = 'dark classic other-class'
                    const clonedElement = mockElement.cloneNode(
                        true,
                    ) as HTMLElement
                    clonedDoc.body.appendChild(clonedElement)

                    if (options.onclone) {
                        await options.onclone(clonedDoc, clonedElement)
                    }

                    clonedBodyClasses = Array.from(clonedDoc.body.classList)

                    return mockCanvas
                },
            )

            await act(async () => {
                await result.current.exportToPDF(elementRef)
            })

            expect(clonedBodyClasses).not.toContain('dark')
            expect(clonedBodyClasses).not.toContain('classic')
            expect(clonedBodyClasses).toContain('light')
            expect(clonedBodyClasses).toContain('other-class')
        })

        it('should handle body with multiple theme classes simultaneously', async () => {
            const { result } = renderHook(() => useExportDashboardToPDF())
            const elementRef = { current: mockElement }

            let clonedBodyClasses: string[] = []
            ;(html2canvas as unknown as jest.Mock).mockImplementationOnce(
                async (
                    _element: HTMLElement,
                    options: {
                        onclone?: (
                            doc: Document,
                            element: HTMLElement,
                        ) => Promise<void>
                    },
                ) => {
                    const clonedDoc =
                        document.implementation.createHTMLDocument()
                    clonedDoc.body.className = 'dark classic light container'
                    const clonedElement = mockElement.cloneNode(
                        true,
                    ) as HTMLElement
                    clonedDoc.body.appendChild(clonedElement)

                    if (options.onclone) {
                        await options.onclone(clonedDoc, clonedElement)
                    }

                    clonedBodyClasses = Array.from(clonedDoc.body.classList)

                    return mockCanvas
                },
            )

            await act(async () => {
                await result.current.exportToPDF(elementRef)
            })

            expect(clonedBodyClasses).not.toContain('dark')
            expect(clonedBodyClasses).not.toContain('classic')
            expect(clonedBodyClasses).toContain('light')
        })
    })

    describe('Filename generation', () => {
        it('should format default filename with current date', async () => {
            const { result } = renderHook(() => useExportDashboardToPDF())
            const elementRef = { current: mockElement }
            const mockFormat = jest.fn().mockReturnValue('2024-03-15')
            ;(moment as unknown as jest.Mock).mockReturnValueOnce({
                format: mockFormat,
            })

            await act(async () => {
                await result.current.exportToPDF(elementRef)
            })

            expect(mockFormat).toHaveBeenCalledWith('YYYY-MM-DD')
            expect(mockPDF.save).toHaveBeenCalledWith(
                'analytics-overview-2024-03-15.pdf',
            )
        })

        it('should use YYYY-MM-DD format in default filename', async () => {
            const { result } = renderHook(() => useExportDashboardToPDF())
            const elementRef = { current: mockElement }
            const mockFormat = jest.fn().mockReturnValue('2024-12-25')
            ;(moment as unknown as jest.Mock).mockReturnValueOnce({
                format: mockFormat,
            })

            await act(async () => {
                await result.current.exportToPDF(elementRef)
            })

            expect(mockPDF.save).toHaveBeenCalledWith(
                'analytics-overview-2024-12-25.pdf',
            )
        })

        it('should use default filename when given empty string', async () => {
            const { result } = renderHook(() => useExportDashboardToPDF())
            const elementRef = { current: mockElement }

            await act(async () => {
                await result.current.exportToPDF(elementRef, '')
            })

            expect(mockPDF.save).toHaveBeenCalledWith(
                'analytics-overview-2024-01-15.pdf',
            )
        })
    })

    describe('SVG sprite processing edge cases', () => {
        it('should handle symbol with no child elements', async () => {
            const { result } = renderHook(() => useExportDashboardToPDF())

            const symbol = document.createElementNS(
                'http://www.w3.org/2000/svg',
                'symbol',
            )
            symbol.id = 'empty-symbol'
            document.body.appendChild(symbol)

            const svg = document.createElementNS(
                'http://www.w3.org/2000/svg',
                'svg',
            )
            const use = document.createElementNS(
                'http://www.w3.org/2000/svg',
                'use',
            )
            use.setAttribute('href', '#empty-symbol')
            svg.appendChild(use)
            mockElement.appendChild(svg)

            const elementRef = { current: mockElement }

            await act(async () => {
                await result.current.exportToPDF(elementRef)
            })

            expect(result.current.isSuccess).toBe(true)

            document.body.removeChild(symbol)
        })

        it('should handle href with multiple # characters', async () => {
            const { result } = renderHook(() => useExportDashboardToPDF())

            const svg = document.createElementNS(
                'http://www.w3.org/2000/svg',
                'svg',
            )
            const use = document.createElementNS(
                'http://www.w3.org/2000/svg',
                'use',
            )
            use.setAttribute('href', '/sprite.svg#icon#extra')
            svg.appendChild(use)
            mockElement.appendChild(svg)

            const mockSvgSprite = `
                <svg xmlns="http://www.w3.org/2000/svg">
                    <symbol id="icon" viewBox="0 0 24 24">
                        <path d="M0 0h24v24H0z"/>
                    </symbol>
                </svg>
            `
            global.fetch = jest.fn().mockResolvedValue({
                text: () => Promise.resolve(mockSvgSprite),
            })

            const elementRef = { current: mockElement }

            await act(async () => {
                await result.current.exportToPDF(elementRef)
            })

            expect(result.current.isSuccess).toBe(true)
        })

        it('should be case-sensitive when matching symbol IDs', async () => {
            const { result } = renderHook(() => useExportDashboardToPDF())

            const symbol = document.createElementNS(
                'http://www.w3.org/2000/svg',
                'symbol',
            )
            symbol.id = 'icon'
            const path = document.createElementNS(
                'http://www.w3.org/2000/svg',
                'path',
            )
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
            use.setAttribute('href', '#Icon')
            svg.appendChild(use)
            mockElement.appendChild(svg)

            const elementRef = { current: mockElement }

            let clonedSvgHasPath = false
            ;(html2canvas as unknown as jest.Mock).mockImplementationOnce(
                async (
                    _element: HTMLElement,
                    options: {
                        onclone?: (
                            doc: Document,
                            element: HTMLElement,
                        ) => Promise<void>
                    },
                ) => {
                    const clonedDoc =
                        document.implementation.createHTMLDocument()
                    const clonedElement = mockElement.cloneNode(
                        true,
                    ) as HTMLElement
                    clonedDoc.body.appendChild(clonedElement)

                    if (options.onclone) {
                        await options.onclone(clonedDoc, clonedElement)
                    }

                    const clonedSvg = clonedDoc.body.querySelector('svg')
                    clonedSvgHasPath = !!clonedSvg?.querySelector('path')

                    return mockCanvas
                },
            )

            await act(async () => {
                await result.current.exportToPDF(elementRef)
            })

            expect(clonedSvgHasPath).toBe(false)

            document.body.removeChild(symbol)
        })
    })

    describe('Timing', () => {
        it('should wait 100ms before calling html2canvas', async () => {
            jest.useFakeTimers()
            const { result } = renderHook(() => useExportDashboardToPDF())
            const elementRef = { current: mockElement }

            let html2canvasCalled = false
            ;(html2canvas as unknown as jest.Mock).mockImplementationOnce(
                async () => {
                    html2canvasCalled = true
                    return mockCanvas
                },
            )

            act(() => {
                result.current.exportToPDF(elementRef).then(() => {})
            })

            await act(async () => {
                await jest.advanceTimersByTimeAsync(50)
            })

            expect(html2canvasCalled).toBe(false)

            await act(async () => {
                await jest.advanceTimersByTimeAsync(100)
            })

            expect(html2canvasCalled).toBe(true)

            jest.useRealTimers()
        })
    })
})
