import { assumeMock, render } from '@repo/testing'
import { screen } from '@testing-library/react'

import { DownloadPerformanceOverviewAgentButton } from 'domains/reporting/pages/performance/overview/charts/breakdownTables/PerformanceOverviewAgentTable/DownloadPerformanceOverviewAgentButton'
import { useDownloadPerformanceOverviewAgentData } from 'domains/reporting/pages/performance/overview/hooks/agentBreakdown/useDownloadPerformanceOverviewAgentData'

jest.mock(
    'domains/reporting/pages/performance/overview/hooks/agentBreakdown/useDownloadPerformanceOverviewAgentData',
)

const mockUseDownloadPerformanceOverviewAgentData = assumeMock(
    useDownloadPerformanceOverviewAgentData,
)

describe('DownloadPerformanceOverviewAgentButton', () => {
    afterEach(() => {
        jest.clearAllMocks()
    })

    it('renders an enabled download button once the data has finished loading', () => {
        mockUseDownloadPerformanceOverviewAgentData.mockReturnValue({
            files: { 'report.csv': 'Agent,Average CSAT\r\nAlice,4.5' },
            fileName: 'report.csv',
            isLoading: false,
        })

        render(<DownloadPerformanceOverviewAgentButton />)

        const button = screen.getByRole('button', { name: /download/i })
        expect(button).toBeInTheDocument()
        expect(button).toBeEnabled()
    })

    it('disables the download button while the data is loading', () => {
        mockUseDownloadPerformanceOverviewAgentData.mockReturnValue({
            files: {},
            fileName: '',
            isLoading: true,
        })

        render(<DownloadPerformanceOverviewAgentButton />)

        expect(screen.getByRole('button', { name: /download/i })).toBeDisabled()
    })
})
