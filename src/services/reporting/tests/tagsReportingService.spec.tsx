import { renderHook } from '@testing-library/react-hooks'

import { tags } from 'fixtures/tag'
import { getCsvFileNameWithDates } from 'hooks/reporting/support-performance/overview/useDownloadOverviewData'
import * as ticketCountPerTag from 'hooks/reporting/ticket-insights/useTicketCountPerTag'
import { fetchTagsTicketCountTimeSeries } from 'hooks/reporting/timeSeries'
import { OrderDirection } from 'models/api/types'
import { ReportingGranularity } from 'models/reporting/types'
import { formatDates } from 'pages/stats/utils'
import {
    createReport,
    fetchTagsReportData,
    TAGS_REPORT_FILE_NAME,
    useTagsReportData,
} from 'services/reporting/tagsReportingService'
import { TagsTableOrder } from 'state/ui/stats/tagsReportSlice'
import { createCsv } from 'utils/file'
import { assumeMock } from 'utils/testing'

jest.mock('hooks/reporting/timeSeries')
const fetchTagsTicketCountTimeSeriesMock = assumeMock(
    fetchTagsTicketCountTimeSeries,
)

describe('TagsReportingService', () => {
    const tag = tags[0]
    const tagsTableOrder: TagsTableOrder = {
        column: 'tag',
        direction: OrderDirection.Desc,
    }
    const deletedTagId = '789'
    const timezone = 'UTC'
    const granularity = ReportingGranularity.Day
    const data: ticketCountPerTag.FormattedDataItem[] = [
        {
            tagId: String(tag.id),
            tag,
            timeSeries: [
                { value: 100, dateTime: '2023-06-07' },
                { value: 23, dateTime: '2023-06-08' },
                {
                    value: 0,
                    dateTime: '2023-06-09',
                },
            ],
            total: 123,
        },
        {
            tagId: deletedTagId,
            tag: undefined,
            timeSeries: [
                { value: 200, dateTime: '2023-06-07' },
                { value: 13, dateTime: '2023-06-08' },
                {
                    value: 0,
                    dateTime: '2023-06-09',
                },
            ],
            total: 213,
        },
    ]
    const dateTimes = ['2023-06-07', '2023-06-08', '2023-06-09']
    const period = {
        start_datetime: '2023-06-07T00:00:00.000Z',
        end_datetime: '2023-06-09T23:59:00.000Z',
    }
    const fileName = getCsvFileNameWithDates(period, TAGS_REPORT_FILE_NAME)
    const expectedData = [
        [
            'tag',
            'total',
            formatDates(granularity, '2023-06-07'),
            formatDates(granularity, '2023-06-08'),
            formatDates(granularity, '2023-06-09'),
        ],
        ['billing', 123, 100, 23, 0],
        [deletedTagId, 213, 200, 13, 0],
    ]

    describe('createReport', () => {
        it('should save report ', () => {
            const report = createReport(data, dateTimes, period, granularity)

            expect(report).toEqual({
                files: {
                    [fileName]: createCsv(expectedData),
                },
                fileName,
            })
        })
    })

    describe('useTicketCountPerTag', () => {
        it('should fetch and format Tags Report data', () => {
            jest.spyOn(
                ticketCountPerTag,
                'useTicketCountPerTag',
            ).mockReturnValue({
                data,
                dateTimes,
                isLoading: false,
                cleanStatsFilters: { period },
                granularity,
                order: tagsTableOrder,
                setOrdering: jest.fn(),
                grandTotal: 10,
                columnTotals: [5, 5, 0],
            })
            const { result } = renderHook(() => useTagsReportData())

            expect(result.current).toEqual({
                files: {
                    [fileName]: createCsv(expectedData),
                },
                fileName,
                isLoading: false,
            })
        })
    })

    describe('fetchTicketCountPerTag', () => {
        const granularity = ReportingGranularity.Day
        const tagId = 'billing'
        const exampleResponse = {
            [tagId]: [
                [
                    {
                        dateTime: '2023-06-07',
                        value: 100,
                        label: 'TicketTagsEnriched.ticketCount',
                    },
                    {
                        dateTime: '2023-06-08',
                        value: 23,
                        label: 'TicketTagsEnriched.ticketCount',
                    },
                    {
                        dateTime: '2023-06-09',
                        value: 0,
                        label: 'TicketTagsEnriched.ticketCount',
                    },
                ],
            ],
            [deletedTagId]: [
                [
                    {
                        dateTime: '2023-06-07',
                        value: 200,
                        label: 'TicketTagsEnriched.ticketCount',
                    },
                    {
                        dateTime: '2023-06-08',
                        value: 13,
                        label: 'TicketTagsEnriched.ticketCount',
                    },
                    {
                        dateTime: '2023-06-09',
                        value: 0,
                        label: 'TicketTagsEnriched.ticketCount',
                    },
                ],
            ],
        }
        beforeEach(() => {
            fetchTagsTicketCountTimeSeriesMock.mockResolvedValue(
                exampleResponse,
            )
        })

        it('should fetch and format the report', async () => {
            const context = {
                tags: tags.reduce(
                    (acc, tag) => ({ ...acc, [tag.id]: tag }),
                    {},
                ),
                tagsTableOrder,
            }
            const result = await fetchTagsReportData(
                { period },
                timezone,
                granularity,
                context,
            )
            expect(result).toEqual({
                files: {
                    [fileName]: createCsv(expectedData),
                },
                fileName,
                isLoading: false,
            })
        })
    })
})
