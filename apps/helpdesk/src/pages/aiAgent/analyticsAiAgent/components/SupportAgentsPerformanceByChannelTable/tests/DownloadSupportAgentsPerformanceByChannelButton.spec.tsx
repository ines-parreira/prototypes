import { render } from '@testing-library/react'

import { SUPPORT_AGENTS_PERFORMANCE_BY_CHANNEL_TABLE } from 'pages/aiAgent/analyticsAiAgent/components/SupportAgentsPerformanceByChannelTable/columns'
import { DownloadSupportAgentsPerformanceByChannelButton } from 'pages/aiAgent/analyticsAiAgent/components/SupportAgentsPerformanceByChannelTable/DownloadSupportAgentsPerformanceByChannelButton'

const mockDownloadTableButton = jest.fn()

jest.mock(
    'pages/aiAgent/analyticsOverview/components/shared/DownloadTableButton',
    () => ({
        DownloadTableButton: (props: unknown) => mockDownloadTableButton(props),
    }),
)

jest.mock(
    'pages/aiAgent/analyticsAiAgent/hooks/useDownloadSupportAgentsPerformanceByChannelData',
)

const mockUseDownloadSupportAgentsPerformanceByChannelData = jest.requireMock(
    'pages/aiAgent/analyticsAiAgent/hooks/useDownloadSupportAgentsPerformanceByChannelData',
).useDownloadSupportAgentsPerformanceByChannelData as jest.Mock

const mockFiles = {
    'report.csv': `"${SUPPORT_AGENTS_PERFORMANCE_BY_CHANNEL_TABLE.title}"\r\n"email"`,
}
const mockFileName =
    '2024-01-01_2024-01-31-support_agents_performance_by_channel_table.csv'

beforeEach(() => {
    mockUseDownloadSupportAgentsPerformanceByChannelData.mockReturnValue({
        files: mockFiles,
        fileName: mockFileName,
        isLoading: false,
    })
})

describe('DownloadSupportAgentsPerformanceByChannelButton', () => {
    afterEach(() => {
        jest.clearAllMocks()
    })

    it('passes files and fileName from the hook to DownloadTableButton', () => {
        render(<DownloadSupportAgentsPerformanceByChannelButton />)

        expect(mockDownloadTableButton).toHaveBeenCalledWith(
            expect.objectContaining({
                files: mockFiles,
                fileName: mockFileName,
            }),
        )
    })

    it('passes isLoading from the hook to DownloadTableButton', () => {
        mockUseDownloadSupportAgentsPerformanceByChannelData.mockReturnValue({
            files: {},
            fileName: mockFileName,
            isLoading: true,
        })
        render(<DownloadSupportAgentsPerformanceByChannelButton />)

        expect(mockDownloadTableButton).toHaveBeenCalledWith(
            expect.objectContaining({ isLoading: true }),
        )
    })

    it('passes the correct segmentEventName to DownloadTableButton', () => {
        render(<DownloadSupportAgentsPerformanceByChannelButton />)

        expect(mockDownloadTableButton).toHaveBeenCalledWith(
            expect.objectContaining({
                segmentEventName:
                    'ai-agent_support-agent_channel-performance-table',
            }),
        )
    })
})
