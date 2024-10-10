import {act, fireEvent, screen} from '@testing-library/react'
import React from 'react'
import {OrderDirection} from 'models/api/types'
import {logEvent, SegmentEvent} from 'common/segment'
import {tags} from 'fixtures/tag'
import {useTicketCountPerTag} from 'hooks/reporting/ticket-insights/useTicketCountPerTag'
import {getPeriodDateTimes} from 'hooks/reporting/useTimeSeries'
import {ReportingGranularity} from 'models/reporting/types'
import {formatDates} from 'pages/stats/utils'
import {DOWNLOAD_DATA_BUTTON_LABEL} from 'pages/stats/constants'
import {TagsReportDownloadDataButton} from 'pages/stats/ticket-insights/tags/TagsReportDownloadDataButton'
import {saveReport} from 'services/reporting/tagsReportingService'
import {getFilterDateRange} from 'utils/reporting'
import {assumeMock, renderWithStore} from 'utils/testing'

jest.mock('services/reporting/tagsReportingService')
const saveReportMock = assumeMock(saveReport)

jest.mock('hooks/reporting/ticket-insights/useTicketCountPerTag')
const useTicketCountPerTagMock = assumeMock(useTicketCountPerTag)

jest.mock('common/segment')
const logEventMock = assumeMock(logEvent)

describe('<TagsReportDownloadDataButton />', () => {
    const period = {
        start_datetime: '2021-02-03T00:00:00.000Z',
        end_datetime: '2021-02-06T23:59:59.999Z',
    }
    const granularity = ReportingGranularity.Day
    const tag = tags[0]
    const data = [
        {
            tagId: String(tag.id),
            tag,
            total: 10,
            timeSeries: [
                {value: 5, dateTime: 'someDateTime'},
                {value: 5, dateTime: 'someDateTime'},
                {value: 0, dateTime: 'someDateTime'},
            ],
        },
    ]
    const dateTimes = getPeriodDateTimes(
        getFilterDateRange(period),
        granularity
    )
    const formattedDateTimes = dateTimes.map((date) =>
        formatDates(granularity, date)
    )

    beforeEach(() => {
        useTicketCountPerTagMock.mockReturnValue({
            data,
            dateTimes,
            isLoading: false,
            cleanStatsFilters: {period},
            granularity,
            order: {column: 'tag', direction: OrderDirection.Asc},
            setOrdering: jest.fn(),
            grandTotal: 10,
            columnTotals: [5, 5, 0],
        })
    })

    it('should render the Button', () => {
        renderWithStore(<TagsReportDownloadDataButton />, {})

        expect(
            screen.getByRole('button', {
                name: new RegExp(DOWNLOAD_DATA_BUTTON_LABEL),
            })
        ).toBeInTheDocument()
    })

    it('should call SaveReport on click', () => {
        renderWithStore(<TagsReportDownloadDataButton />, {})

        fireEvent.click(screen.getByRole('button'))

        expect(saveReportMock).toHaveBeenCalledWith(
            data,
            formattedDateTimes,
            period
        )
    })

    it('should send event to segment and call saveReport on download data button click', () => {
        renderWithStore(<TagsReportDownloadDataButton />, {})

        act(() => {
            fireEvent.click(screen.getByRole('button'))
        })

        expect(logEventMock).toHaveBeenCalledWith(
            SegmentEvent.StatDownloadClicked,
            expect.objectContaining({
                name: 'all-metrics',
            })
        )
    })
})
