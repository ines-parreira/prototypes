import { render, renderHook } from '@repo/testing'

import '@testing-library/react'

import {
    DownloadPerformanceBreakdownButton,
    useDownloadPerformanceBreakdownAction,
} from 'pages/aiAgent/analyticsOverview/components/PerformanceBreakdownTable/DownloadPerformanceBreakdownButton'

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

jest.mock(
    'pages/aiAgent/analyticsOverview/hooks/useDownloadPerformanceBreakdownData',
)

const mockUseDownloadPerformanceBreakdownData = jest.requireMock(
    'pages/aiAgent/analyticsOverview/hooks/useDownloadPerformanceBreakdownData',
).useDownloadPerformanceBreakdownData as jest.Mock

const mockFiles = { 'report.csv': '"Feature"\r\n"AI Agent"' }
const mockFileName = '2024-01-01_2024-01-31-all_features_table.csv'

beforeEach(() => {
    mockUseDownloadPerformanceBreakdownData.mockReturnValue({
        files: mockFiles,
        fileName: mockFileName,
        isLoading: false,
    })
})

describe('useDownloadPerformanceBreakdownAction', () => {
    it('calls useDownloadTableAction with data from the hook and the correct segment event name', () => {
        const mockResult = { onClick: jest.fn(), isLoading: false }
        mockUseDownloadTableAction.mockReturnValue(mockResult)

        const { result } = renderHook(() =>
            useDownloadPerformanceBreakdownAction(),
        )

        expect(mockUseDownloadTableAction).toHaveBeenCalledWith({
            files: mockFiles,
            fileName: mockFileName,
            isLoading: false,
            segmentEventName: 'performance-breakdown',
        })
        expect(result.current).toBe(mockResult)
    })
})

describe('DownloadPerformanceBreakdownButton', () => {
    afterEach(() => {
        jest.clearAllMocks()
    })

    it('passes files and fileName from the hook to DownloadTableButton', () => {
        render(<DownloadPerformanceBreakdownButton />)

        expect(mockDownloadTableButton).toHaveBeenCalledWith(
            expect.objectContaining({
                files: mockFiles,
                fileName: mockFileName,
            }),
        )
    })

    it('passes isLoading from the hook to DownloadTableButton', () => {
        mockUseDownloadPerformanceBreakdownData.mockReturnValue({
            files: {},
            fileName: mockFileName,
            isLoading: true,
        })

        render(<DownloadPerformanceBreakdownButton />)

        expect(mockDownloadTableButton).toHaveBeenCalledWith(
            expect.objectContaining({ isLoading: true }),
        )
    })

    it('passes the correct segmentEventName to DownloadTableButton', () => {
        render(<DownloadPerformanceBreakdownButton />)

        expect(mockDownloadTableButton).toHaveBeenCalledWith(
            expect.objectContaining({
                segmentEventName: 'performance-breakdown',
            }),
        )
    })
})
