import { logEvent, SegmentEvent } from '@repo/logging'
import { assumeMock } from '@repo/testing'
import { act, fireEvent, render, waitFor } from '@testing-library/react'

import { getCsvFileNameWithDates } from 'domains/reporting/hooks/common/utils'
import {
    SLA_REPORT_FILENAME,
    useDownloadSLAsData,
} from 'domains/reporting/hooks/sla/useDownloadSLAsData'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { ReportingGranularity } from 'domains/reporting/models/types'
import {
    DEFAULT_TIMEZONE,
    DOWNLOAD_DATA_BUTTON_LABEL,
} from 'domains/reporting/pages/constants'
import { DownloadSLAsData } from 'domains/reporting/pages/sla/components/DownloadSLAsData'
import { saveZippedFiles } from 'utils/file'

jest.mock('@repo/logging')
const logEventMock = logEvent as jest.MockedFunction<typeof logEvent>

jest.mock('utils/file')
const saveZippedFilesMock = assumeMock(saveZippedFiles)
jest.mock('domains/reporting/hooks/support-performance/useStatsFilters')
const useStatsFiltersMock = assumeMock(useStatsFilters)

jest.mock('domains/reporting/hooks/sla/useDownloadSLAsData')
const useDownloadSLAsDataMock = assumeMock(useDownloadSLAsData)

const defaultStatsFilters: StatsFilters = {
    period: {
        start_datetime: '2021-02-03T00:00:00.000',
        end_datetime: '2021-02-03T23:59:59.999',
    },
}

describe('DownloadSLAsData', () => {
    const fileName = getCsvFileNameWithDates(
        defaultStatsFilters.period,
        SLA_REPORT_FILENAME,
    )
    const reportData = {
        ['someFileName']: 'someData',
    }

    beforeEach(() => {
        useStatsFiltersMock.mockReturnValue({
            cleanStatsFilters: defaultStatsFilters,
            userTimezone: DEFAULT_TIMEZONE,
            granularity: ReportingGranularity.Day,
        })
        useDownloadSLAsDataMock.mockReturnValue({
            files: reportData,
            fileName,
            isLoading: false,
        })
    })

    it('should send event to segment and call saveReport on download data button click', async () => {
        const { getByText } = render(
            <DownloadSLAsData>{DOWNLOAD_DATA_BUTTON_LABEL}</DownloadSLAsData>,
        )

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
            }),
        )
        expect(saveZippedFilesMock).toHaveBeenCalledWith(reportData, fileName)
    })
})
