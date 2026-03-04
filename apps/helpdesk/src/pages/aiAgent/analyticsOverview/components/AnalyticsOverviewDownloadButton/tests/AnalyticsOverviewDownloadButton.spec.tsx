import { createRef } from 'react'

import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { useExportDashboardToPDF } from 'pages/aiAgent/analyticsOverview/hooks/useExportDashboardToPDF'

import { AnalyticsOverviewDownloadButton } from '../AnalyticsOverviewDownloadButton'

jest.mock('pages/aiAgent/analyticsOverview/hooks/useExportDashboardToPDF')
jest.mock('appNode', () => ({
    useAppNode: () => document.body,
}))

const mockExportToPDF = jest.fn()
const mockExportToCSV = jest.fn()

const mockedUseExportDashboardToPDF = jest.mocked(useExportDashboardToPDF)

const mockUseCsvExport = jest.fn().mockReturnValue({
    triggerDownload: mockExportToCSV,
    isLoading: false,
})

describe('AnalyticsOverviewDownloadButton', () => {
    const contentRef = createRef<HTMLDivElement>()

    beforeEach(() => {
        jest.clearAllMocks()
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

    it('should render the export button', () => {
        render(
            <AnalyticsOverviewDownloadButton
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
            <AnalyticsOverviewDownloadButton
                contentRef={contentRef}
                useCsvExport={mockUseCsvExport}
            />,
        )

        const button = screen.getByRole('button', { name: /export/i })
        await act(() => user.click(button))

        expect(screen.getByText('Export as CSV')).toBeInTheDocument()
        expect(screen.getByText('Export as PDF')).toBeInTheDocument()
    })

    it('should call exportToCSV when "Export as CSV" is clicked', async () => {
        const user = userEvent.setup()
        render(
            <AnalyticsOverviewDownloadButton
                contentRef={contentRef}
                useCsvExport={mockUseCsvExport}
            />,
        )

        const button = screen.getByRole('button', { name: /export/i })
        await act(() => user.click(button))

        const csvOption = screen.getByText('Export as CSV')
        await act(() => user.click(csvOption))

        expect(mockExportToCSV).toHaveBeenCalled()
    })

    it('should call exportToPDF when "Export as PDF" is clicked', async () => {
        const user = userEvent.setup()
        render(
            <AnalyticsOverviewDownloadButton
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
            <AnalyticsOverviewDownloadButton
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
            <AnalyticsOverviewDownloadButton
                contentRef={contentRef}
                useCsvExport={mockUseCsvExport}
            />,
        )

        const button = screen.getByRole('button', { name: /exporting/i })
        expect(button).toBeInTheDocument()
        expect(button).toBeDisabled()
    })

    it('should disable button while data is loading but show "Export" text', () => {
        mockUseCsvExport.mockReturnValue({
            triggerDownload: mockExportToCSV,
            isLoading: true,
        })

        render(
            <AnalyticsOverviewDownloadButton
                contentRef={contentRef}
                useCsvExport={mockUseCsvExport}
            />,
        )

        const button = screen.getByRole('button', { name: /export/i })
        expect(button).toBeInTheDocument()
        expect(button).toBeDisabled()
        expect(screen.queryByText('Exporting...')).not.toBeInTheDocument()
    })

    it('should be enabled when not loading', () => {
        render(
            <AnalyticsOverviewDownloadButton
                contentRef={contentRef}
                useCsvExport={mockUseCsvExport}
            />,
        )

        const button = screen.getByRole('button', { name: /export/i })
        expect(button).not.toBeDisabled()
    })
})
