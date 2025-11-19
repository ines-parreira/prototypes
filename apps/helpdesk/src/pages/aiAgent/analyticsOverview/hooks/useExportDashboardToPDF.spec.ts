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
})
