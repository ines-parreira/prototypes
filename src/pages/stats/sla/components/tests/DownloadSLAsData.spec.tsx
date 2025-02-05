import {act, fireEvent, render, waitFor} from '@testing-library/react'

import React from 'react'

import {logEvent, SegmentEvent} from 'common/segment'
import {
    SLA_REPORT_FILENAME,
    useDownloadSLAsData,
} from 'hooks/reporting/sla/useDownloadSLAsData'
import {getCsvFileNameWithDates} from 'hooks/reporting/support-performance/overview/useDownloadOverviewData'
import {useNewStatsFilters} from 'hooks/reporting/support-performance/useNewStatsFilters'
import {ReportingGranularity} from 'models/reporting/types'
import {LegacyStatsFilters} from 'models/stat/types'
import {
    DEFAULT_TIMEZONE,
    DOWNLOAD_DATA_BUTTON_LABEL,
} from 'pages/stats/constants'

import {DownloadSLAsData} from 'pages/stats/sla/components/DownloadSLAsData'
import {saveZippedFiles} from 'utils/file'
import {assumeMock} from 'utils/testing'

jest.mock('common/segment')
const logEventMock = logEvent as jest.MockedFunction<typeof logEvent>

jest.mock('utils/file')
const saveZippedFilesMock = assumeMock(saveZippedFiles)
jest.mock('hooks/reporting/support-performance/useNewStatsFilters')
const useNewStatsFiltersMock = assumeMock(useNewStatsFilters)

jest.mock('hooks/reporting/sla/useDownloadSLAsData')
const useDownloadSLAsDataMock = assumeMock(useDownloadSLAsData)

const defaultStatsFilters: LegacyStatsFilters = {
    period: {
        start_datetime: '2021-02-03T00:00:00.000',
        end_datetime: '2021-02-03T23:59:59.999',
    },
}

describe('DownloadSLAsData', () => {
    const fileName = getCsvFileNameWithDates(
        defaultStatsFilters.period,
        SLA_REPORT_FILENAME
    )
    const reportData = {
        ['someFileName']: 'someData',
    }

    beforeEach(() => {
        useNewStatsFiltersMock.mockReturnValue({
            cleanStatsFilters: defaultStatsFilters,
            userTimezone: DEFAULT_TIMEZONE,
            granularity: ReportingGranularity.Day,
            isAnalyticsNewFilters: true,
        })
        useDownloadSLAsDataMock.mockReturnValue({
            files: reportData,
            fileName,
            isLoading: false,
        })
    })

    it('should send event to segment and call saveReport on download data button click', async () => {
        const {getByText} = render(<DownloadSLAsData />)

        const button = getByText(DOWNLOAD_DATA_BUTTON_LABEL)
        await waitFor(() => {
            expect(button).toBeAriaEnabled()
        })
        act(() => {
            fireEvent.click(button)
        })

        expect(logEventMock).toHaveBeenCalledWith(
            SegmentEvent.StatDownloadClicked,
            expect.objectContaining({
                name: 'all-metrics',
            })
        )
        expect(saveZippedFilesMock).toHaveBeenCalledWith(reportData, fileName)
    })
})
