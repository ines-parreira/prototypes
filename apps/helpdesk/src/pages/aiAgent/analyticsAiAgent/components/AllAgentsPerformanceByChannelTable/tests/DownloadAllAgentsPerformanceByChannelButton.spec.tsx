import { render } from '@testing-library/react'

import { ALL_AGENTS_PERFORMANCE_BY_CHANNEL_TABLE } from 'pages/aiAgent/analyticsAiAgent/components/AllAgentsPerformanceByChannelTable/columns'
import { DownloadAllAgentsPerformanceByChannelButton } from 'pages/aiAgent/analyticsAiAgent/components/AllAgentsPerformanceByChannelTable/DownloadAllAgentsPerformanceByChannelButton'

const mockDownloadTableButton = jest.fn()

jest.mock(
    'pages/aiAgent/analyticsOverview/components/shared/DownloadTableButton',
    () => ({
        DownloadTableButton: (props: unknown) => mockDownloadTableButton(props),
    }),
)

jest.mock(
    'pages/aiAgent/analyticsAiAgent/hooks/useDownloadAllAgentsPerformanceByChannelData',
)

const mockUseDownloadAllAgentsPerformanceByChannelData = jest.requireMock(
    'pages/aiAgent/analyticsAiAgent/hooks/useDownloadAllAgentsPerformanceByChannelData',
).useDownloadAllAgentsPerformanceByChannelData as jest.Mock

const mockFiles = {
    'report.csv': `"${ALL_AGENTS_PERFORMANCE_BY_CHANNEL_TABLE.title}"\r\n"email"`,
}
const mockFileName =
    '2024-01-01_2024-01-31-all_agents_performance_by_channel_table.csv'

beforeEach(() => {
    mockUseDownloadAllAgentsPerformanceByChannelData.mockReturnValue({
        files: mockFiles,
        fileName: mockFileName,
        isLoading: false,
    })
})

describe('DownloadAllAgentsPerformanceByChannelButton', () => {
    afterEach(() => {
        jest.clearAllMocks()
    })

    it('passes files and fileName from the hook to DownloadTableButton', () => {
        render(<DownloadAllAgentsPerformanceByChannelButton />)

        expect(mockDownloadTableButton).toHaveBeenCalledWith(
            expect.objectContaining({
                files: mockFiles,
                fileName: mockFileName,
            }),
        )
    })

    it('passes isLoading from the hook to DownloadTableButton', () => {
        mockUseDownloadAllAgentsPerformanceByChannelData.mockReturnValue({
            files: {},
            fileName: mockFileName,
            isLoading: true,
        })
        render(<DownloadAllAgentsPerformanceByChannelButton />)

        expect(mockDownloadTableButton).toHaveBeenCalledWith(
            expect.objectContaining({ isLoading: true }),
        )
    })

    it('passes the correct segmentEventName to DownloadTableButton', () => {
        render(<DownloadAllAgentsPerformanceByChannelButton />)

        expect(mockDownloadTableButton).toHaveBeenCalledWith(
            expect.objectContaining({
                segmentEventName:
                    'ai-agent_all-agents_channel-performance-table',
            }),
        )
    })
})
