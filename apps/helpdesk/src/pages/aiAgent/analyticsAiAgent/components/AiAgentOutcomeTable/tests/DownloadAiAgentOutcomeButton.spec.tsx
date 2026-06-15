import { render, renderHook } from '@repo/testing'

import '@testing-library/react'

import {
    DownloadAiAgentOutcomeButton,
    useDownloadAiAgentOutcomeAction,
} from 'pages/aiAgent/analyticsAiAgent/components/AiAgentOutcomeTable/DownloadAiAgentOutcomeButton'

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

jest.mock('pages/aiAgent/analyticsAiAgent/hooks/useDownloadAiAgentOutcomeData')

const mockUseDownloadAiAgentOutcomeData = jest.requireMock(
    'pages/aiAgent/analyticsAiAgent/hooks/useDownloadAiAgentOutcomeData',
).useDownloadAiAgentOutcomeData as jest.Mock

const mockFiles = { 'ai_agent_outcome_table.csv': 'AI Agent outcome\r\nClosed' }
const mockFileName = 'ai_agent_outcome_table.csv'

beforeEach(() => {
    jest.clearAllMocks()
    mockUseDownloadAiAgentOutcomeData.mockReturnValue({
        files: mockFiles,
        fileName: mockFileName,
        isLoading: false,
    })
})

describe('useDownloadAiAgentOutcomeAction', () => {
    it('calls useDownloadTableAction with hook data and the segment event name', () => {
        const mockResult = { onClick: jest.fn(), isLoading: false }
        mockUseDownloadTableAction.mockReturnValue(mockResult)

        const { result } = renderHook(() => useDownloadAiAgentOutcomeAction())

        expect(mockUseDownloadTableAction).toHaveBeenCalledWith({
            files: mockFiles,
            fileName: mockFileName,
            isLoading: false,
            segmentEventName: 'ai-agent_all-agents_ai-agent-outcome-table',
        })
        expect(result.current).toBe(mockResult)
    })
})

describe('DownloadAiAgentOutcomeButton', () => {
    it('passes files and fileName from the hook to DownloadTableButton', () => {
        render(<DownloadAiAgentOutcomeButton />)

        expect(mockDownloadTableButton).toHaveBeenCalledWith(
            expect.objectContaining({
                files: mockFiles,
                fileName: mockFileName,
            }),
        )
    })

    it('passes isLoading from the hook to DownloadTableButton', () => {
        mockUseDownloadAiAgentOutcomeData.mockReturnValue({
            files: {},
            fileName: mockFileName,
            isLoading: true,
        })
        render(<DownloadAiAgentOutcomeButton />)

        expect(mockDownloadTableButton).toHaveBeenCalledWith(
            expect.objectContaining({ isLoading: true }),
        )
    })

    it('passes the correct segmentEventName to DownloadTableButton', () => {
        render(<DownloadAiAgentOutcomeButton />)

        expect(mockDownloadTableButton).toHaveBeenCalledWith(
            expect.objectContaining({
                segmentEventName: 'ai-agent_all-agents_ai-agent-outcome-table',
            }),
        )
    })
})
