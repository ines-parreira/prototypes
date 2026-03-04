import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import * as downloadHook from 'pages/aiAgent/analyticsOverview/hooks/useDownloadPerformanceBreakdownData'
import * as fileUtils from 'utils/file'

import { DownloadPerformanceBreakdownButton } from '../DownloadPerformanceBreakdownButton'

jest.mock(
    'pages/aiAgent/analyticsOverview/hooks/useDownloadPerformanceBreakdownData',
)
jest.mock('utils/file', () => ({
    ...jest.requireActual('utils/file'),
    saveFileAsDownloaded: jest.fn(),
}))

const mockUseDownloadPerformanceBreakdownData =
    downloadHook.useDownloadPerformanceBreakdownData as jest.Mock

beforeEach(() => {
    jest.clearAllMocks()
})

const renderComponent = () => {
    return render(<DownloadPerformanceBreakdownButton />)
}

describe('DownloadPerformanceBreakdownButton', () => {
    const mockCsvContent =
        '"Feature","Overall automation rate"\r\n"AI Agent","18%"'
    const mockFileName = '2024-01-01_2024-01-31-performance-breakdown.csv'

    beforeEach(() => {
        mockUseDownloadPerformanceBreakdownData.mockReturnValue({
            files: {
                [mockFileName]: mockCsvContent,
            },
            fileName: mockFileName,
            isLoading: false,
        })
    })

    it('should render download button', () => {
        renderComponent()

        const button = screen.getByRole('button', { name: /download/i })
        expect(button).toBeInTheDocument()
    })

    it('should be disabled when loading', () => {
        mockUseDownloadPerformanceBreakdownData.mockReturnValue({
            files: {},
            fileName: mockFileName,
            isLoading: true,
        })

        renderComponent()

        const button = screen.getByRole('button', { name: /download/i })
        expect(button).toBeAriaDisabled()
    })

    it('should call saveFileAsDownloaded when clicked', async () => {
        const user = userEvent.setup()
        const saveFileSpy = jest.spyOn(fileUtils, 'saveFileAsDownloaded')

        renderComponent()

        const button = screen.getByRole('button', { name: /download/i })

        await user.click(button)

        await waitFor(() => {
            expect(saveFileSpy).toHaveBeenCalled()
        })

        const [fileName, csvContent, contentType] = saveFileSpy.mock.calls[0]
        expect(fileName).toBe(mockFileName)
        expect(csvContent).toBe(mockCsvContent)
        expect(contentType).toBe('text/csv')
    })
})
