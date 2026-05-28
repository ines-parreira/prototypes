import { render, renderHook } from '@repo/testing'

import '@testing-library/react'

import { ALL_AGENTS_PERFORMANCE_BY_INTENT_TABLE } from 'pages/aiAgent/analyticsAiAgent/components/AllAgentsPerformanceByIntentTable/columns'
import {
    DownloadAllAgentsPerformanceByIntentButton,
    useDownloadAllAgentsPerformanceByIntentAction,
} from 'pages/aiAgent/analyticsAiAgent/components/AllAgentsPerformanceByIntentTable/DownloadAllAgentsPerformanceByIntentButton'

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
    'pages/aiAgent/analyticsAiAgent/hooks/useDownloadAllAgentsPerformanceByIntentData',
)

const mockUseDownloadAllAgentsPerformanceByIntentData = jest.requireMock(
    'pages/aiAgent/analyticsAiAgent/hooks/useDownloadAllAgentsPerformanceByIntentData',
).useDownloadAllAgentsPerformanceByIntentData as jest.Mock

const mockFiles = {
    'report.csv': `"${ALL_AGENTS_PERFORMANCE_BY_INTENT_TABLE.title}"\r\n"Billing :: Refund Request"`,
}
const mockFileName =
    '2024-01-01_2024-01-31-all_agents_performance_by_intent_table.csv'

beforeEach(() => {
    mockUseDownloadAllAgentsPerformanceByIntentData.mockReturnValue({
        files: mockFiles,
        fileName: mockFileName,
        isLoading: false,
    })
})

describe('useDownloadAllAgentsPerformanceByIntentAction', () => {
    it('calls useDownloadTableAction with data from the hook and the correct segment event name', () => {
        const mockResult = { onClick: jest.fn(), isLoading: false }
        mockUseDownloadTableAction.mockReturnValue(mockResult)

        const { result } = renderHook(() =>
            useDownloadAllAgentsPerformanceByIntentAction(),
        )

        expect(mockUseDownloadTableAction).toHaveBeenCalledWith({
            files: mockFiles,
            fileName: mockFileName,
            isLoading: false,
            segmentEventName: 'ai-agent_all-agents_intent-breakdown-table',
        })
        expect(result.current).toBe(mockResult)
    })
})

describe('DownloadAllAgentsPerformanceByIntentButton', () => {
    afterEach(() => {
        jest.clearAllMocks()
    })

    it('passes files and fileName from the hook to DownloadTableButton', () => {
        render(<DownloadAllAgentsPerformanceByIntentButton />)

        expect(mockDownloadTableButton).toHaveBeenCalledWith(
            expect.objectContaining({
                files: mockFiles,
                fileName: mockFileName,
            }),
        )
    })

    it('passes isLoading from the hook to DownloadTableButton', () => {
        mockUseDownloadAllAgentsPerformanceByIntentData.mockReturnValue({
            files: {},
            fileName: mockFileName,
            isLoading: true,
        })
        render(<DownloadAllAgentsPerformanceByIntentButton />)

        expect(mockDownloadTableButton).toHaveBeenCalledWith(
            expect.objectContaining({ isLoading: true }),
        )
    })

    it('passes the correct segmentEventName to DownloadTableButton', () => {
        render(<DownloadAllAgentsPerformanceByIntentButton />)

        expect(mockDownloadTableButton).toHaveBeenCalledWith(
            expect.objectContaining({
                segmentEventName: 'ai-agent_all-agents_intent-breakdown-table',
            }),
        )
    })
})
