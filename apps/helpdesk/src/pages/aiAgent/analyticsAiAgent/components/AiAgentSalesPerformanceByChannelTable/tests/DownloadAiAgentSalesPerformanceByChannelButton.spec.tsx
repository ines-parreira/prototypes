import { render, renderHook } from '@repo/testing'

import '@testing-library/react'

import { AI_AGENT_SALES_PERFORMANCE_BY_CHANNEL_TABLE } from 'pages/aiAgent/analyticsAiAgent/components/AiAgentSalesPerformanceByChannelTable/columns'
import {
    DownloadAiAgentSalesPerformanceByChannelButton,
    useDownloadAiAgentSalesPerformanceByChannelAction,
} from 'pages/aiAgent/analyticsAiAgent/components/AiAgentSalesPerformanceByChannelTable/DownloadAiAgentSalesPerformanceByChannelButton'

const mockDownloadTableButton = jest.fn()
const mockUseDownloadTableAction = jest.fn()

jest.mock(
    'pages/aiAgent/analyticsOverview/components/shared/DownloadTableButton',
    () => ({
        DownloadTableButton: (props: unknown) => mockDownloadTableButton(props),
        useDownloadTableAction: (...args: unknown[]) =>
            mockUseDownloadTableAction(...args),
    }),
)

jest.mock(
    'pages/aiAgent/analyticsAiAgent/hooks/useDownloadAiAgentSalesPerformanceByChannelData',
)

const mockUseDownloadAiAgentSalesPerformanceByChannelData = jest.requireMock(
    'pages/aiAgent/analyticsAiAgent/hooks/useDownloadAiAgentSalesPerformanceByChannelData',
).useDownloadAiAgentSalesPerformanceByChannelData as jest.Mock

const mockFiles = {
    'report.csv': `"${AI_AGENT_SALES_PERFORMANCE_BY_CHANNEL_TABLE.title}"\r\n"email"`,
}
const mockFileName =
    '2024-01-01_2024-01-31-ai_agent_sales_performance_by_channel_table.csv'

beforeEach(() => {
    mockUseDownloadAiAgentSalesPerformanceByChannelData.mockReturnValue({
        files: mockFiles,
        fileName: mockFileName,
        isLoading: false,
    })
})

describe('useDownloadAiAgentSalesPerformanceByChannelAction', () => {
    it('calls useDownloadTableAction with data from the hook and the correct segment event name', () => {
        const mockResult = { onClick: jest.fn(), isLoading: false }
        mockUseDownloadTableAction.mockReturnValue(mockResult)

        const { result } = renderHook(() =>
            useDownloadAiAgentSalesPerformanceByChannelAction(),
        )

        expect(mockUseDownloadTableAction).toHaveBeenCalledWith({
            files: mockFiles,
            fileName: mockFileName,
            isLoading: false,
            segmentEventName: 'ai-agent_sales-agent_channel-performance-table',
        })
        expect(result.current).toBe(mockResult)
    })
})

describe('DownloadAiAgentSalesPerformanceByChannelButton', () => {
    afterEach(() => {
        jest.clearAllMocks()
    })

    it('passes files and fileName from the hook to DownloadTableButton', () => {
        render(<DownloadAiAgentSalesPerformanceByChannelButton />)

        expect(mockDownloadTableButton).toHaveBeenCalledWith(
            expect.objectContaining({
                files: mockFiles,
                fileName: mockFileName,
            }),
        )
    })

    it('passes isLoading from the hook to DownloadTableButton', () => {
        mockUseDownloadAiAgentSalesPerformanceByChannelData.mockReturnValue({
            files: {},
            fileName: mockFileName,
            isLoading: true,
        })
        render(<DownloadAiAgentSalesPerformanceByChannelButton />)

        expect(mockDownloadTableButton).toHaveBeenCalledWith(
            expect.objectContaining({ isLoading: true }),
        )
    })

    it('passes the correct segmentEventName to DownloadTableButton', () => {
        render(<DownloadAiAgentSalesPerformanceByChannelButton />)

        expect(mockDownloadTableButton).toHaveBeenCalledWith(
            expect.objectContaining({
                segmentEventName:
                    'ai-agent_sales-agent_channel-performance-table',
            }),
        )
    })
})
