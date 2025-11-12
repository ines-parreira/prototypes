import React from 'react'

import { logEvent, SegmentEvent } from '@repo/logging'
import { assumeMock, userEvent } from '@repo/testing'
import { render, screen } from '@testing-library/react'

import { useChannelsReportMetrics } from 'domains/reporting/hooks/support-performance/channels/useChannelsReportMetrics'
import { ChannelsDownloadDataButton } from 'domains/reporting/pages/support-performance/channels/ChannelsDownloadDataButton'
import { channels } from 'fixtures/channels'
import { saveZippedFiles } from 'utils/file'

jest.mock(
    'domains/reporting/hooks/support-performance/channels/useChannelsReportMetrics',
)
const useChannelsReportMetricsMock = assumeMock(useChannelsReportMetrics)

jest.mock('utils/file')
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
