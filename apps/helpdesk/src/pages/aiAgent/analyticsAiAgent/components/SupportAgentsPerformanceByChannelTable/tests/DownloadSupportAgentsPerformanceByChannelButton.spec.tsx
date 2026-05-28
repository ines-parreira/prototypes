import { render, renderHook } from '@repo/testing'

import '@testing-library/react'

import { SUPPORT_AGENTS_PERFORMANCE_BY_CHANNEL_TABLE } from 'pages/aiAgent/analyticsAiAgent/components/SupportAgentsPerformanceByChannelTable/columns'
import {
    DownloadSupportAgentsPerformanceByChannelButton,
    useDownloadSupportAgentsPerformanceByChannelAction,
} from 'pages/aiAgent/analyticsAiAgent/components/SupportAgentsPerformanceByChannelTable/DownloadSupportAgentsPerformanceByChannelButton'

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

describe('useDownloadSupportAgentsPerformanceByChannelAction', () => {
    it('calls useDownloadTableAction with data from the hook and the correct segment event name', () => {
        const mockResult = { onClick: jest.fn(), isLoading: false }
        mockUseDownloadTableAction.mockReturnValue(mockResult)

        const { result } = renderHook(() =>
            useDownloadSupportAgentsPerformanceByChannelAction(),
        )

        expect(mockUseDownloadTableAction).toHaveBeenCalledWith({
            files: mockFiles,
            fileName: mockFileName,
            isLoading: false,
            segmentEventName:
                'ai-agent_support-agent_channel-performance-table',
        })
        expect(result.current).toBe(mockResult)
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
