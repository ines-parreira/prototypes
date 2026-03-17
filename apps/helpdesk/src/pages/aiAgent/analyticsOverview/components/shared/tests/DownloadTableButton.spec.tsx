import * as logging from '@repo/logging'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { DownloadTableButton } from 'pages/aiAgent/analyticsOverview/components/shared/DownloadTableButton'
import * as fileUtils from 'utils/file'

jest.mock('@repo/logging', () => ({
    logEvent: jest.fn(),
    SegmentEvent: { StatDownloadClicked: 'stat_download_clicked' },
}))

jest.mock('utils/file', () => ({
    ...jest.requireActual('utils/file'),
    saveFileAsDownloaded: jest.fn(),
}))

const mockFiles = { 'report.csv': '"Feature"\r\n"AI Agent","18%"' }
const mockFileName = 'report.csv'

const renderComponent = (overrides = {}) =>
    render(
        <DownloadTableButton
            files={mockFiles}
            fileName={mockFileName}
            isLoading={false}
            segmentEventName="test-table"
            {...overrides}
        />,
    )

describe('DownloadTableButton', () => {
    afterEach(() => {
        jest.clearAllMocks()
    })

    it('renders a download button', () => {
        renderComponent()

        expect(
            screen.getByRole('button', { name: /download/i }),
        ).toBeInTheDocument()
    })

    it('is disabled when isLoading is true', () => {
        renderComponent({ isLoading: true })

        expect(
            screen.getByRole('button', { name: /download/i }),
        ).toBeAriaDisabled()
    })

    it('logs the segment event and saves the file on click', async () => {
        const user = userEvent.setup()
        const saveFileSpy = jest.spyOn(fileUtils, 'saveFileAsDownloaded')
        const logEventSpy = jest.spyOn(logging, 'logEvent')

        renderComponent()

        await user.click(screen.getByRole('button', { name: /download/i }))

        await waitFor(() => {
            expect(logEventSpy).toHaveBeenCalledWith(
                logging.SegmentEvent.StatDownloadClicked,
                { name: 'test-table' },
            )
            expect(saveFileSpy).toHaveBeenCalledWith(
                mockFileName,
                mockFiles[mockFileName],
                'text/csv',
            )
        })
    })
})
