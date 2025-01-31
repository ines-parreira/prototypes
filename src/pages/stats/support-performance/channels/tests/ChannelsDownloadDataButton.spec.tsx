import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import React from 'react'

import {logEvent, SegmentEvent} from 'common/segment'
import {channels} from 'fixtures/channels'
import {useChannelsReportMetrics} from 'hooks/reporting/useChannelsReportMetrics'
import {ChannelsDownloadDataButton} from 'pages/stats/support-performance/channels/ChannelsDownloadDataButton'
import {saveZippedFiles} from 'utils/file'
import {assumeMock} from 'utils/testing'

jest.mock('hooks/reporting/useChannelsReportMetrics')
const useChannelsReportMetricsMock = assumeMock(useChannelsReportMetrics)

jest.mock('utils/file')
const saveZippedFilesMock = assumeMock(saveZippedFiles)

jest.mock('common/segment')
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
            })
        )
    })
})
