import { assumeMock, render } from '@repo/testing'
import { screen } from '@testing-library/react'

import { DownloadPerformanceOverviewChannelButton } from 'domains/reporting/pages/performance/overview/charts/breakdownTables/PerformanceOverviewChannelTable/DownloadPerformanceOverviewChannelButton'
import { useDownloadPerformanceOverviewChannelData } from 'domains/reporting/pages/performance/overview/hooks/channelBreakdown/useDownloadPerformanceOverviewChannelData'

jest.mock(
    'domains/reporting/pages/performance/overview/hooks/channelBreakdown/useDownloadPerformanceOverviewChannelData',
)

const mockUseDownloadPerformanceOverviewChannelData = assumeMock(
    useDownloadPerformanceOverviewChannelData,
)

describe('DownloadPerformanceOverviewChannelButton', () => {
    afterEach(() => {
        jest.clearAllMocks()
    })

    it('renders an enabled download button once the data has finished loading', () => {
        mockUseDownloadPerformanceOverviewChannelData.mockReturnValue({
            files: { 'report.csv': 'Channel,Average CSAT\r\nEmail,4.5' },
            fileName: 'report.csv',
            isLoading: false,
        })

        render(<DownloadPerformanceOverviewChannelButton />)

        const button = screen.getByRole('button', { name: /download/i })
        expect(button).toBeInTheDocument()
        expect(button).toBeEnabled()
    })

    it('disables the download button while the data is loading', () => {
        mockUseDownloadPerformanceOverviewChannelData.mockReturnValue({
            files: {},
            fileName: '',
            isLoading: true,
        })

        render(<DownloadPerformanceOverviewChannelButton />)

        expect(screen.getByRole('button', { name: /download/i })).toBeDisabled()
    })
})
