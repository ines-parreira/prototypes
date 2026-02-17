import React from 'react'

import { logEvent, SegmentEvent } from '@repo/logging'
import { assumeMock, userEvent } from '@repo/testing'
import { saveZippedFiles } from '@repo/utils'
import { render, screen } from '@testing-library/react'

import { useChannelsReportMetrics } from 'domains/reporting/hooks/support-performance/channels/useChannelsReportMetrics'
import { ChannelsDownloadDataButton } from 'domains/reporting/pages/support-performance/channels/ChannelsDownloadDataButton'
import { channels } from 'fixtures/channels'

jest.mock(
    'domains/reporting/hooks/support-performance/channels/useChannelsReportMetrics',
)
const useChannelsReportMetricsMock = assumeMock(useChannelsReportMetrics)

jest.mock('@repo/utils', () => ({
    ...jest.requireActual('@repo/utils'),
    saveZippedFiles: jest.fn(),
    saveFileAsDownloaded: jest.fn(),
    saveBlobAsDownloaded: jest.fn(),
    createCsv: jest.fn(),
    getText: jest.fn(),
    getBase64: jest.fn(),
    getFileTooLargeError: jest.fn(),
}))
const saveZippedFilesMock = assumeMock(saveZippedFiles)

jest.mock('@repo/logging')
const logEventMock = assumeMock(logEvent)

describe('ChannelsDownloadDataButton', () => {
    const reportData = {} as any
    const isLoading = false
    const files = {}
    const fileName = 'someFileName'

    beforeEach(() => {
        useChannelsReportMetricsMock.mockReturnValue({
            files,
            fileName,
            reportData,
            channels,
            isLoading,
        })
    })

    it('should fetch data and allow calling the csv with report and report the click', () => {
        render(<ChannelsDownloadDataButton />)
        userEvent.click(screen.getByRole('button'))

        expect(saveZippedFilesMock).toHaveBeenCalledWith(files, fileName)
        expect(logEventMock).toHaveBeenCalledWith(
            SegmentEvent.StatDownloadClicked,
            expect.objectContaining({
                name: 'all-metrics',
            }),
        )
    })
})
