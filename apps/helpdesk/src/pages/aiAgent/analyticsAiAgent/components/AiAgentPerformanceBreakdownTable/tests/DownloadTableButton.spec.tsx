import { logEvent, SegmentEvent } from '@repo/logging'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import {
    ExportFormat,
    useAiAgentAnalyticsDashboardTracking,
} from 'pages/aiAgent/hooks/useAiAgentAnalyticsDashboardTracking'
import { saveFileAsDownloaded } from 'utils/file'

import { DownloadTableButton } from '../DownloadTableButton'

jest.mock('@repo/logging', () => ({
    logEvent: jest.fn(),
    SegmentEvent: {
        StatDownloadClicked: 'stat_download_clicked',
    },
}))

jest.mock('utils/file', () => ({
    saveFileAsDownloaded: jest.fn(),
}))

jest.mock('pages/aiAgent/hooks/useAiAgentAnalyticsDashboardTracking')

const mockedLogEvent = jest.mocked(logEvent)
const mockedSaveFileAsDownloaded = jest.mocked(saveFileAsDownloaded)
const mockOnExport = jest.fn()
const mockedUseAiAgentAnalyticsDashboardTracking = jest.mocked(
    useAiAgentAnalyticsDashboardTracking,
)

describe('DownloadTableButton', () => {
    const defaultProps = {
        files: { 'test-file.csv': 'csv,content,here' },
        fileName: 'test-file.csv',
        isLoading: false,
        tableName: 'Test Table',
    }

    beforeEach(() => {
        jest.clearAllMocks()
        mockedUseAiAgentAnalyticsDashboardTracking.mockReturnValue({
            onExport: mockOnExport,
            onAnalyticsReportViewed: jest.fn(),
            onAnalyticsAiAgentTabSelected: jest.fn(),
            onTableTabInteraction: jest.fn(),
        })
    })

    it('should render a download button', () => {
        render(<DownloadTableButton {...defaultProps} />)

        expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('should disable button when isLoading is true', () => {
        render(<DownloadTableButton {...defaultProps} isLoading={true} />)

        expect(screen.getByRole('button')).toBeDisabled()
    })

    it('should enable button when isLoading is false', () => {
        render(<DownloadTableButton {...defaultProps} isLoading={false} />)

        expect(screen.getByRole('button')).not.toBeDisabled()
    })

    it('should log event, track export, and save file when clicked', async () => {
        const user = userEvent.setup()
        render(<DownloadTableButton {...defaultProps} />)

        await user.click(screen.getByRole('button'))

        expect(mockedLogEvent).toHaveBeenCalledWith(
            SegmentEvent.StatDownloadClicked,
            { name: 'Test Table' },
        )
        expect(mockOnExport).toHaveBeenCalledWith({ format: ExportFormat.CSV })
        expect(mockedSaveFileAsDownloaded).toHaveBeenCalledWith(
            'test-file.csv',
            'csv,content,here',
            'text/csv',
        )
    })

    it('should not trigger click when disabled', async () => {
        const user = userEvent.setup()
        render(<DownloadTableButton {...defaultProps} isLoading={true} />)

        const button = screen.getByRole('button')
        await user.click(button)

        expect(mockedLogEvent).not.toHaveBeenCalled()
        expect(mockOnExport).not.toHaveBeenCalled()
        expect(mockedSaveFileAsDownloaded).not.toHaveBeenCalled()
    })

    it('should pass correct table name to logging', async () => {
        const user = userEvent.setup()
        render(
            <DownloadTableButton
                {...defaultProps}
                tableName="Channel Performance"
            />,
        )

        await user.click(screen.getByRole('button'))

        expect(mockedLogEvent).toHaveBeenCalledWith(
            SegmentEvent.StatDownloadClicked,
            { name: 'Channel Performance' },
        )
    })

    it('should use first file content when multiple files provided', async () => {
        const user = userEvent.setup()
        const multipleFiles = {
            'file1.csv': 'first,file,content',
            'file2.csv': 'second,file,content',
        }
        render(
            <DownloadTableButton
                {...defaultProps}
                files={multipleFiles}
                fileName="file1.csv"
            />,
        )

        await user.click(screen.getByRole('button'))

        expect(mockedSaveFileAsDownloaded).toHaveBeenCalledWith(
            'file1.csv',
            'first,file,content',
            'text/csv',
        )
    })
})
