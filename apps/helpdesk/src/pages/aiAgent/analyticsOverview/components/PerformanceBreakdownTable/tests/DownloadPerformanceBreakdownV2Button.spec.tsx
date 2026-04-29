import { render } from '@repo/testing'

import '@testing-library/react'

import { DownloadPerformanceBreakdownV2Button } from 'pages/aiAgent/analyticsOverview/components/PerformanceBreakdownTable/DownloadPerformanceBreakdownV2Button'

const mockDownloadTableButton = jest.fn((__props: unknown) => null)

jest.mock(
    'pages/aiAgent/analyticsOverview/components/shared/DownloadTableButton',
    () => ({
        DownloadTableButton: (props: unknown) => mockDownloadTableButton(props),
    }),
)

jest.mock(
    'pages/aiAgent/analyticsOverview/hooks/useDownloadPerformanceBreakdownV2Data',
)

const mockUseDownloadPerformanceBreakdownV2Data = jest.requireMock(
    'pages/aiAgent/analyticsOverview/hooks/useDownloadPerformanceBreakdownV2Data',
).useDownloadPerformanceBreakdownV2Data as jest.Mock

const mockFiles = { 'report.csv': '"Feature"\r\n"AI Agent"' }
const mockFileName = '2024-01-01_2024-01-31-all_features_table.csv'

beforeEach(() => {
    mockUseDownloadPerformanceBreakdownV2Data.mockReturnValue({
        files: mockFiles,
        fileName: mockFileName,
        isLoading: false,
    })
})

describe('DownloadPerformanceBreakdownV2Button', () => {
    afterEach(() => {
        jest.clearAllMocks()
    })

    it('passes files and fileName from the hook to DownloadTableButton', () => {
        render(<DownloadPerformanceBreakdownV2Button />)

        expect(mockDownloadTableButton).toHaveBeenCalledWith(
            expect.objectContaining({
                files: mockFiles,
                fileName: mockFileName,
            }),
        )
    })

    it('passes isLoading from the hook to DownloadTableButton', () => {
        mockUseDownloadPerformanceBreakdownV2Data.mockReturnValue({
            files: {},
            fileName: mockFileName,
            isLoading: true,
        })

        render(<DownloadPerformanceBreakdownV2Button />)

        expect(mockDownloadTableButton).toHaveBeenCalledWith(
            expect.objectContaining({ isLoading: true }),
        )
    })

    it('passes the correct segmentEventName to DownloadTableButton', () => {
        render(<DownloadPerformanceBreakdownV2Button />)

        expect(mockDownloadTableButton).toHaveBeenCalledWith(
            expect.objectContaining({
                segmentEventName: 'performance-breakdown',
            }),
        )
    })
})
