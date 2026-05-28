import { render, renderHook } from '@repo/testing'

import '@testing-library/react'

import {
    DownloadFlowsButton,
    useDownloadFlowsAction,
} from 'pages/aiAgent/analyticsOverview/components/FlowsTable/DownloadFlowsButton'

const mockDownloadTableButton = jest.fn((__props: unknown) => null)
const mockUseDownloadTableAction = jest.fn()

jest.mock(
    'pages/aiAgent/analyticsOverview/components/shared/DownloadTableButton',
    () => ({
        DownloadTableButton: (props: unknown) => mockDownloadTableButton(props),
        useDownloadTableAction: (...args: unknown[]) =>
            mockUseDownloadTableAction(...args),
    }),
)

jest.mock('pages/aiAgent/analyticsOverview/hooks/useDownloadFlowsData')

const mockUseDownloadFlowsData = jest.requireMock(
    'pages/aiAgent/analyticsOverview/hooks/useDownloadFlowsData',
).useDownloadFlowsData as jest.Mock

const mockFiles = { 'report.csv': '"Flows"\r\n"Product availability"' }
const mockFileName = '2024-01-01_2024-01-31-flows-table.csv'

beforeEach(() => {
    mockUseDownloadFlowsData.mockReturnValue({
        files: mockFiles,
        fileName: mockFileName,
        isLoading: false,
    })
})

describe('useDownloadFlowsAction', () => {
    it('calls useDownloadTableAction with data from the hook and the correct segment event name', () => {
        const mockResult = { onClick: jest.fn(), isLoading: false }
        mockUseDownloadTableAction.mockReturnValue(mockResult)

        const { result } = renderHook(() => useDownloadFlowsAction())

        expect(mockUseDownloadTableAction).toHaveBeenCalledWith({
            files: mockFiles,
            fileName: mockFileName,
            isLoading: false,
            segmentEventName: 'ai-agent_overview_flows-table',
        })
        expect(result.current).toBe(mockResult)
    })
})

describe('DownloadFlowsButton', () => {
    afterEach(() => {
        jest.clearAllMocks()
    })

    it('passes files and fileName from the hook to DownloadTableButton', () => {
        render(<DownloadFlowsButton />)

        expect(mockDownloadTableButton).toHaveBeenCalledWith(
            expect.objectContaining({
                files: mockFiles,
                fileName: mockFileName,
            }),
        )
    })

    it('passes isLoading from the hook to DownloadTableButton', () => {
        mockUseDownloadFlowsData.mockReturnValue({
            files: {},
            fileName: mockFileName,
            isLoading: true,
        })

        render(<DownloadFlowsButton />)

        expect(mockDownloadTableButton).toHaveBeenCalledWith(
            expect.objectContaining({ isLoading: true }),
        )
    })

    it('passes the correct segmentEventName to DownloadTableButton', () => {
        render(<DownloadFlowsButton />)

        expect(mockDownloadTableButton).toHaveBeenCalledWith(
            expect.objectContaining({
                segmentEventName: 'ai-agent_overview_flows-table',
            }),
        )
    })
})
