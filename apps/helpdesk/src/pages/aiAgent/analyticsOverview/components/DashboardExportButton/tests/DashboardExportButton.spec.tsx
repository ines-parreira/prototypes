import { createRef } from 'react'

import { reportError } from '@repo/logging'
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { useExportDashboardToPDF } from 'pages/aiAgent/analyticsOverview/hooks/useExportDashboardToPDF'
import {
    ExportFormat,
    useAiAgentAnalyticsDashboardTracking,
} from 'pages/aiAgent/hooks/useAiAgentAnalyticsDashboardTracking'

import { DashboardExportButton } from '../DashboardExportButton'

jest.mock('pages/aiAgent/analyticsOverview/hooks/useExportDashboardToPDF')
jest.mock('pages/aiAgent/hooks/useAiAgentAnalyticsDashboardTracking')
jest.mock('@repo/logging')
jest.mock('appNode', () => ({
    useAppNode: () => document.body,
}))

const mockReportError = jest.mocked(reportError)

const mockExportToPDF = jest.fn()
const mockExportToCSV = jest.fn()
const mockOnExport = jest.fn()

const mockedUseExportDashboardToPDF = jest.mocked(useExportDashboardToPDF)
const mockedUseAiAgentAnalyticsDashboardTracking = jest.mocked(
    useAiAgentAnalyticsDashboardTracking,
)

const mockUseCsvExport = jest.fn().mockReturnValue({
    triggerDownload: mockExportToCSV,
    isLoading: false,
})

describe('DashboardExportButton', () => {
    const contentRef = createRef<HTMLDivElement>()

    beforeEach(() => {
        jest.clearAllMocks()
        mockExportToCSV.mockResolvedValue(undefined)
        mockedUseExportDashboardToPDF.mockReturnValue({
            exportToPDF: mockExportToPDF,
            isLoading: false,
            isSuccess: false,
            isError: false,
            error: null,
        })
        mockedUseAiAgentAnalyticsDashboardTracking.mockReturnValue({
            onExport: mockOnExport,
            onAnalyticsReportViewed: jest.fn(),
            onAnalyticsAiAgentTabSelected: jest.fn(),
            onTableTabInteraction: jest.fn(),
        })
        mockUseCsvExport.mockReturnValue({
            triggerDownload: mockExportToCSV,
            isLoading: false,
        })
    })

    it('should render the export button', () => {
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

    it('should open dropdown when button is clicked', async () => {
        const user = userEvent.setup()
        render(
            <DashboardExportButton
                contentRef={contentRef}
                useCsvExport={mockUseCsvExport}
            />,
        )

        const button = screen.getByRole('button', { name: /export/i })
        await act(() => user.click(button))

        expect(screen.getByText('Export as CSV')).toBeInTheDocument()
        expect(screen.getByText('Export as PDF')).toBeInTheDocument()
    })

    it('should call exportToPDF when "Export as PDF" is clicked', async () => {
        const user = userEvent.setup()
        render(
            <DashboardExportButton
                contentRef={contentRef}
                useCsvExport={mockUseCsvExport}
            />,
        )

        const button = screen.getByRole('button', { name: /export/i })
        await act(() => user.click(button))

        const pdfOption = screen.getByText('Export as PDF')
        await act(() => user.click(pdfOption))

        expect(mockExportToPDF).toHaveBeenCalledWith(contentRef, undefined)
    })

    it('should call exportToPDF with custom filename when pdfFileName is provided', async () => {
        const user = userEvent.setup()
        render(
            <DashboardExportButton
                contentRef={contentRef}
                useCsvExport={mockUseCsvExport}
                pdfFileName="ai-agent-all-agents"
            />,
        )

        const button = screen.getByRole('button', { name: /export/i })
        await act(() => user.click(button))

        const pdfOption = screen.getByText('Export as PDF')
        await act(() => user.click(pdfOption))

        expect(mockExportToPDF).toHaveBeenCalledWith(
            contentRef,
            expect.stringMatching(
                /^ai-agent-all-agents-\d{4}-\d{2}-\d{2}\.pdf$/,
            ),
        )
    })

    it('should show loading state while PDF is exporting', () => {
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

        const button = screen.getByRole('button', { name: /exporting/i })
        expect(button).toBeInTheDocument()
        expect(button).toBeDisabled()
    })

    it('should be enabled when not loading', () => {
        render(
            <DashboardExportButton
                contentRef={contentRef}
                useCsvExport={mockUseCsvExport}
            />,
        )

        const button = screen.getByRole('button', { name: /export/i })
        expect(button).not.toBeDisabled()
    })

    describe('tracking', () => {
        it('should track CSV format when "Export as CSV" is clicked', async () => {
            const user = userEvent.setup()
            render(
                <DashboardExportButton
                    contentRef={contentRef}
                    useCsvExport={mockUseCsvExport}
                />,
            )

            await act(() =>
                user.click(screen.getByRole('button', { name: /export/i })),
            )
            await act(() => user.click(screen.getByText('Export as CSV')))

            expect(mockOnExport).toHaveBeenCalledWith({
                format: ExportFormat.CSV,
            })
        })

        it('should track PDF format when "Export as PDF" is clicked', async () => {
            const user = userEvent.setup()
            render(
                <DashboardExportButton
                    contentRef={contentRef}
                    useCsvExport={mockUseCsvExport}
                />,
            )

            await act(() =>
                user.click(screen.getByRole('button', { name: /export/i })),
            )
            await act(() => user.click(screen.getByText('Export as PDF')))

            expect(mockOnExport).toHaveBeenCalledWith({
                format: ExportFormat.PDF,
            })
        })

        it('should not mix up CSV and PDF tracking formats', async () => {
            const user = userEvent.setup()
            render(
                <DashboardExportButton
                    contentRef={contentRef}
                    useCsvExport={mockUseCsvExport}
                />,
            )

            await act(() =>
                user.click(screen.getByRole('button', { name: /export/i })),
            )
            await act(() => user.click(screen.getByText('Export as CSV')))

            expect(mockOnExport).not.toHaveBeenCalledWith({
                format: ExportFormat.PDF,
            })
        })
    })

    describe('error reporting', () => {
        it('should report error to Sentry when PDF export fails', async () => {
            const error = new Error('PDF generation failed')
            mockExportToPDF.mockRejectedValue(error)

            const user = userEvent.setup()
            render(
                <DashboardExportButton
                    contentRef={contentRef}
                    useCsvExport={mockUseCsvExport}
                />,
            )

            await act(() =>
                user.click(screen.getByRole('button', { name: /export/i })),
            )
            await act(() => user.click(screen.getByText('Export as PDF')))

            await waitFor(() => {
                expect(mockReportError).toHaveBeenCalledWith(error)
            })
        })

        it('should report error to Sentry when CSV export fails', async () => {
            const error = new Error('CSV generation failed')
            mockExportToCSV.mockRejectedValue(error)

            const user = userEvent.setup()
            render(
                <DashboardExportButton
                    contentRef={contentRef}
                    useCsvExport={mockUseCsvExport}
                />,
            )

            await act(() =>
                user.click(screen.getByRole('button', { name: /export/i })),
            )
            await act(() => user.click(screen.getByText('Export as CSV')))

            await waitFor(() => {
                expect(mockReportError).toHaveBeenCalledWith(error)
            })
        })

        it('should reset to "Export" after CSV export fails', async () => {
            mockExportToCSV.mockRejectedValue(
                new Error('CSV generation failed'),
            )

            const user = userEvent.setup()
            render(
                <DashboardExportButton
                    contentRef={contentRef}
                    useCsvExport={mockUseCsvExport}
                />,
            )

            await act(() =>
                user.click(screen.getByRole('button', { name: /export/i })),
            )
            await act(() => user.click(screen.getByText('Export as CSV')))

            await waitFor(() => {
                expect(
                    screen.getByRole('button', { name: /export/i }),
                ).not.toBeDisabled()
            })
        })
    })

    it('should not call triggerDownload while useCsvExport is still loading', async () => {
        mockUseCsvExport.mockReturnValue({
            triggerDownload: mockExportToCSV,
            isLoading: true,
        })

        const user = userEvent.setup()
        const { rerender } = render(
            <DashboardExportButton
                contentRef={contentRef}
                useCsvExport={mockUseCsvExport}
            />,
        )

        await act(() =>
            user.click(screen.getByRole('button', { name: /export/i })),
        )
        await act(() => user.click(screen.getByText('Export as CSV')))

        expect(mockExportToCSV).not.toHaveBeenCalled()

        mockUseCsvExport.mockReturnValue({
            triggerDownload: mockExportToCSV,
            isLoading: false,
        })
        rerender(
            <DashboardExportButton
                contentRef={contentRef}
                useCsvExport={mockUseCsvExport}
            />,
        )

        await waitFor(() => expect(mockExportToCSV).toHaveBeenCalledTimes(1))
    })

    it('should call triggerDownload only once even if the effect re-runs', async () => {
        const user = userEvent.setup()
        const { rerender } = render(
            <DashboardExportButton
                contentRef={contentRef}
                useCsvExport={mockUseCsvExport}
            />,
        )

        await act(() =>
            user.click(screen.getByRole('button', { name: /export/i })),
        )
        await act(() => user.click(screen.getByText('Export as CSV')))

        await waitFor(() => expect(mockExportToCSV).toHaveBeenCalledTimes(1))

        rerender(
            <DashboardExportButton
                contentRef={contentRef}
                useCsvExport={mockUseCsvExport}
            />,
        )

        expect(mockExportToCSV).toHaveBeenCalledTimes(1)
    })

    describe('CSV export state', () => {
        it('should show "Exporting..." and disable button while CSV export is in progress', async () => {
            let resolveDownload!: () => void
            mockExportToCSV.mockReturnValue(
                new Promise<void>((resolve) => {
                    resolveDownload = resolve
                }),
            )

            const user = userEvent.setup()
            render(
                <DashboardExportButton
                    contentRef={contentRef}
                    useCsvExport={mockUseCsvExport}
                />,
            )

            await act(() =>
                user.click(screen.getByRole('button', { name: /export/i })),
            )
            await act(() => user.click(screen.getByText('Export as CSV')))

            expect(
                screen.getByRole('button', { name: /exporting/i }),
            ).toBeDisabled()

            await act(() => resolveDownload())
        })

        it('should reset to "Export" after CSV download completes', async () => {
            let resolveDownload!: () => void
            mockExportToCSV.mockReturnValue(
                new Promise<void>((resolve) => {
                    resolveDownload = resolve
                }),
            )

            const user = userEvent.setup()
            render(
                <DashboardExportButton
                    contentRef={contentRef}
                    useCsvExport={mockUseCsvExport}
                />,
            )

            await act(() =>
                user.click(screen.getByRole('button', { name: /export/i })),
            )
            await act(() => user.click(screen.getByText('Export as CSV')))
            await act(() => resolveDownload())

            await waitFor(() => {
                expect(
                    screen.getByRole('button', { name: /export/i }),
                ).not.toBeDisabled()
            })
        })
    })
})
