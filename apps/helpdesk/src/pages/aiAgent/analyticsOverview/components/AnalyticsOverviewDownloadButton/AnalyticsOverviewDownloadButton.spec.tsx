import { createRef } from 'react'

import { logEvent, SegmentEvent } from '@repo/logging'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { useExportDashboardToPDF } from 'pages/aiAgent/analyticsOverview/hooks/useExportDashboardToPDF'

import { AnalyticsOverviewDownloadButton } from './AnalyticsOverviewDownloadButton'

jest.mock('pages/aiAgent/analyticsOverview/hooks/useExportDashboardToPDF')
jest.mock('@repo/logging', () => ({
    logEvent: jest.fn(),
    SegmentEvent: {
        StatDownloadClicked: 'stat_download_clicked',
    },
}))

const mockExportToPDF = jest.fn()

const mockedUseExportDashboardToPDF = jest.mocked(useExportDashboardToPDF)

describe('AnalyticsOverviewDownloadButton', () => {
    const dashboardRef = createRef<HTMLDivElement>()

    beforeEach(() => {
        jest.clearAllMocks()
        mockedUseExportDashboardToPDF.mockReturnValue({
            exportToPDF: mockExportToPDF,
            isLoading: false,
            isSuccess: false,
            isError: false,
            error: null,
        })
    })

    it('should render the export button', () => {
        render(<AnalyticsOverviewDownloadButton dashboardRef={dashboardRef} />)

        expect(
            screen.getByRole('button', { name: /export/i }),
        ).toBeInTheDocument()
    })

    it('should call exportToPDF and log event when clicked', async () => {
        const user = userEvent.setup()
        render(<AnalyticsOverviewDownloadButton dashboardRef={dashboardRef} />)

        const button = screen.getByRole('button', { name: /export/i })

        await user.click(button)

        expect(logEvent).toHaveBeenCalledWith(
            SegmentEvent.StatDownloadClicked,
            {
                name: 'analytics-overview',
            },
        )
        expect(mockExportToPDF).toHaveBeenCalledWith(dashboardRef)
    })

    it('should show loading state while exporting', () => {
        mockedUseExportDashboardToPDF.mockReturnValue({
            exportToPDF: mockExportToPDF,
            isLoading: true,
            isSuccess: false,
            isError: false,
            error: null,
        })

        render(<AnalyticsOverviewDownloadButton dashboardRef={dashboardRef} />)

        const button = screen.getByRole('button', { name: /exporting/i })
        expect(button).toBeInTheDocument()
    })

    it('should show success state after export is complete', () => {
        mockedUseExportDashboardToPDF.mockReturnValue({
            exportToPDF: mockExportToPDF,
            isLoading: false,
            isSuccess: true,
            isError: false,
            error: null,
        })

        render(<AnalyticsOverviewDownloadButton dashboardRef={dashboardRef} />)

        expect(
            screen.getByRole('button', { name: /exported/i }),
        ).toBeInTheDocument()
    })

    it('should be enabled after success state', () => {
        mockedUseExportDashboardToPDF.mockReturnValue({
            exportToPDF: mockExportToPDF,
            isLoading: false,
            isSuccess: true,
            isError: false,
            error: null,
        })

        render(<AnalyticsOverviewDownloadButton dashboardRef={dashboardRef} />)

        const button = screen.getByRole('button', { name: /exported/i })
        expect(button).not.toBeDisabled()
    })
})
