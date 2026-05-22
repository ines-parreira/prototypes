import { createRef } from 'react'

import { reportError } from '@repo/logging'
import { render } from '@repo/testing/vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { DashboardExportButton } from '../DashboardExportButton'
import { useExportDashboardToPDF } from '../useExportDashboardToPDF'

vi.mock('../useExportDashboardToPDF')
vi.mock('@repo/logging')

const mockReportError = vi.mocked(reportError)
const mockedUseExportDashboardToPDF = vi.mocked(useExportDashboardToPDF)

const mockExportToPDF = vi.fn()
const mockExportToCSV = vi.fn()
const mockOnExport = vi.fn()

const mockUseCsvExport = vi.fn().mockReturnValue({
    triggerDownload: mockExportToCSV,
    isLoading: false,
})

describe('DashboardExportButton', () => {
    const contentRef = createRef<HTMLDivElement>()

    beforeEach(() => {
        vi.clearAllMocks()
        mockExportToCSV.mockResolvedValue(undefined)
        mockedUseExportDashboardToPDF.mockReturnValue({
            exportToPDF: mockExportToPDF,
            isLoading: false,
            isSuccess: false,
            isError: false,
            error: null,
        })
        mockUseCsvExport.mockReturnValue({
            triggerDownload: mockExportToCSV,
            isLoading: false,
        })
    })

    it('renders the export button', () => {
        render(
            <DashboardExportButton
                contentRef={contentRef}
                useCsvExport={mockUseCsvExport}
            />,
        )

        expect(
            screen.getByRole('button', { name: /export/i }),
        ).toBeInTheDocument()
    })

    it('opens the menu when the button is clicked', async () => {
        const user = userEvent.setup()
        render(
            <DashboardExportButton
                contentRef={contentRef}
                useCsvExport={mockUseCsvExport}
            />,
        )

        await user.click(screen.getByRole('button', { name: /export/i }))

        expect(
            await screen.findByRole('menuitem', { name: /export as csv/i }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('menuitem', { name: /export as pdf/i }),
        ).toBeInTheDocument()
    })

    it('calls exportToPDF with undefined filename when no pdfFileName is provided', async () => {
        const user = userEvent.setup()
        render(
            <DashboardExportButton
                contentRef={contentRef}
                useCsvExport={mockUseCsvExport}
            />,
        )

        await user.click(screen.getByRole('button', { name: /export/i }))
        await user.click(
            await screen.findByRole('menuitem', { name: /export as pdf/i }),
        )

        expect(mockExportToPDF).toHaveBeenCalledWith(contentRef, undefined)
    })

    it('passes a dated filename when pdfFileName is provided', async () => {
        const user = userEvent.setup()
        render(
            <DashboardExportButton
                contentRef={contentRef}
                useCsvExport={mockUseCsvExport}
                pdfFileName="my-dashboard"
            />,
        )

        await user.click(screen.getByRole('button', { name: /export/i }))
        await user.click(
            await screen.findByRole('menuitem', { name: /export as pdf/i }),
        )

        expect(mockExportToPDF).toHaveBeenCalledWith(
            contentRef,
            expect.stringMatching(/^my-dashboard-\d{4}-\d{2}-\d{2}\.pdf$/),
        )
    })

    it('triggers CSV download when "Export as CSV" is selected', async () => {
        const user = userEvent.setup()
        render(
            <DashboardExportButton
                contentRef={contentRef}
                useCsvExport={mockUseCsvExport}
            />,
        )

        await user.click(screen.getByRole('button', { name: /export/i }))
        await user.click(
            await screen.findByRole('menuitem', { name: /export as csv/i }),
        )

        await waitFor(() => {
            expect(mockExportToCSV).toHaveBeenCalled()
        })
    })

    it('reports CSV export errors via @repo/logging', async () => {
        const user = userEvent.setup()
        const csvError = new Error('boom')
        mockExportToCSV.mockRejectedValueOnce(csvError)

        render(
            <DashboardExportButton
                contentRef={contentRef}
                useCsvExport={mockUseCsvExport}
            />,
        )

        await user.click(screen.getByRole('button', { name: /export/i }))
        await user.click(
            await screen.findByRole('menuitem', { name: /export as csv/i }),
        )

        await waitFor(() => {
            expect(mockReportError).toHaveBeenCalledWith(csvError)
        })
    })

    it('calls onExport with "pdf" when exporting to PDF', async () => {
        const user = userEvent.setup()
        render(
            <DashboardExportButton
                contentRef={contentRef}
                useCsvExport={mockUseCsvExport}
                onExport={mockOnExport}
            />,
        )

        await user.click(screen.getByRole('button', { name: /export/i }))
        await user.click(
            await screen.findByRole('menuitem', { name: /export as pdf/i }),
        )

        expect(mockOnExport).toHaveBeenCalledWith('pdf')
    })

    it('calls onExport with "csv" when exporting to CSV', async () => {
        const user = userEvent.setup()
        render(
            <DashboardExportButton
                contentRef={contentRef}
                useCsvExport={mockUseCsvExport}
                onExport={mockOnExport}
            />,
        )

        await user.click(screen.getByRole('button', { name: /export/i }))
        await user.click(
            await screen.findByRole('menuitem', { name: /export as csv/i }),
        )

        expect(mockOnExport).toHaveBeenCalledWith('csv')
    })

    it('disables the export button while a PDF export is in progress', () => {
        mockedUseExportDashboardToPDF.mockReturnValue({
            exportToPDF: mockExportToPDF,
            isLoading: true,
            isSuccess: false,
            isError: false,
            error: null,
        })

        render(
            <DashboardExportButton
                contentRef={contentRef}
                useCsvExport={mockUseCsvExport}
            />,
        )

        expect(
            screen.getByRole('button', { name: /exporting/i }),
        ).toBeDisabled()
    })
})
