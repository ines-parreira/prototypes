import { render } from '@testing-library/react'

import { SUPPORT_AGENTS_PERFORMANCE_BY_INTENT_TABLE } from 'pages/aiAgent/analyticsAiAgent/components/SupportAgentsPerformanceByIntentTable/columns'
import { DownloadSupportAgentsPerformanceByIntentButton } from 'pages/aiAgent/analyticsAiAgent/components/SupportAgentsPerformanceByIntentTable/DownloadSupportAgentsPerformanceByIntentButton'

const mockDownloadTableButton = jest.fn()

jest.mock(
    'pages/aiAgent/analyticsOverview/components/shared/DownloadTableButton',
    () => ({
        DownloadTableButton: (props: unknown) => mockDownloadTableButton(props),
    }),
)

jest.mock(
    'pages/aiAgent/analyticsAiAgent/hooks/useDownloadSupportAgentsPerformanceByIntentData',
)

const mockUseDownloadSupportAgentsPerformanceByIntentData = jest.requireMock(
    'pages/aiAgent/analyticsAiAgent/hooks/useDownloadSupportAgentsPerformanceByIntentData',
).useDownloadSupportAgentsPerformanceByIntentData as jest.Mock

const mockFiles = {
    'report.csv': `"${SUPPORT_AGENTS_PERFORMANCE_BY_INTENT_TABLE.title}"\r\n"Billing :: Refund Request"`,
}
const mockFileName =
    '2024-01-01_2024-01-31-support_agents_performance_by_intent_table.csv'

beforeEach(() => {
    mockUseDownloadSupportAgentsPerformanceByIntentData.mockReturnValue({
        files: mockFiles,
        fileName: mockFileName,
        isLoading: false,
    })
})

describe('DownloadSupportAgentsPerformanceByIntentButton', () => {
    afterEach(() => {
        jest.clearAllMocks()
    })

    it('passes files and fileName from the hook to DownloadTableButton', () => {
        render(<DownloadSupportAgentsPerformanceByIntentButton />)

        expect(mockDownloadTableButton).toHaveBeenCalledWith(
            expect.objectContaining({
                files: mockFiles,
                fileName: mockFileName,
            }),
        )
    })

    it('passes isLoading from the hook to DownloadTableButton', () => {
        mockUseDownloadSupportAgentsPerformanceByIntentData.mockReturnValue({
            files: {},
            fileName: mockFileName,
            isLoading: true,
        })
        render(<DownloadSupportAgentsPerformanceByIntentButton />)

        expect(mockDownloadTableButton).toHaveBeenCalledWith(
            expect.objectContaining({ isLoading: true }),
        )
    })

    it('passes the correct segmentEventName to DownloadTableButton', () => {
        render(<DownloadSupportAgentsPerformanceByIntentButton />)

        expect(mockDownloadTableButton).toHaveBeenCalledWith(
            expect.objectContaining({
                segmentEventName:
                    'ai-agent_support-agent_intent-breakdown-table',
            }),
        )
    })
})
