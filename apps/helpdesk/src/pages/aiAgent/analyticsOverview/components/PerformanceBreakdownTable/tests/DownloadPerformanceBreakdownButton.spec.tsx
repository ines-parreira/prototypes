import { render } from '@testing-library/react'

import { DownloadPerformanceBreakdownButton } from 'pages/aiAgent/analyticsOverview/components/PerformanceBreakdownTable/DownloadPerformanceBreakdownButton'

const mockDownloadTableButton = jest.fn((__props: unknown) => null)

jest.mock(
    'pages/aiAgent/analyticsOverview/components/shared/DownloadTableButton',
    () => ({
        DownloadTableButton: (props: unknown) => mockDownloadTableButton(props),
    }),
)

jest.mock(
    'pages/aiAgent/analyticsOverview/hooks/useDownloadPerformanceBreakdownData',
)

const mockUseDownloadPerformanceBreakdownData = jest.requireMock(
    'pages/aiAgent/analyticsOverview/hooks/useDownloadPerformanceBreakdownData',
).useDownloadPerformanceBreakdownData as jest.Mock

const mockFiles = { 'report.csv': '"Feature"\r\n"AI Agent"' }
const mockFileName = '2024-01-01_2024-01-31-performance-breakdown.csv'

beforeEach(() => {
    mockUseDownloadPerformanceBreakdownData.mockReturnValue({
        files: mockFiles,
        fileName: mockFileName,
        isLoading: false,
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
