import {act, fireEvent, screen, waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import {formatMetricValue} from 'pages/stats/common/utils'
import {formatDates} from 'pages/stats/utils'
import {TOTAL_COLUMN_LABEL} from 'pages/stats/ticket-insights/ticket-fields/CustomFieldsTicketCountBreakdownTable'
import {tags} from 'fixtures/tag'
import {useNewStatsFilters} from 'hooks/reporting/support-performance/useNewStatsFilters'
import {useTicketCountPerTag} from 'hooks/reporting/ticket-insights/useTicketCountPerTag'
import {OrderDirection} from 'models/api/types'
import {ReportingGranularity} from 'models/reporting/types'
import {
    AllUsedTagsTable,
    TAG_COLUMN_LABEL,
} from 'pages/stats/ticket-insights/tags/AllUsedTagsTable'
import {defaultStatsFilters} from 'state/stats/statsSlice'
import {RootState} from 'state/types'

import {ValueMode} from 'state/ui/stats/types'
import {calculatePercentage} from 'utils/reporting'
import {assumeMock, renderWithStore} from 'utils/testing'

jest.mock('hooks/reporting/support-performance/useNewStatsFilters')
const useNewStatsFiltersMock = assumeMock(useNewStatsFilters)

jest.mock('hooks/reporting/ticket-insights/useTicketCountPerTag')
const useTicketCountPerTagMock = assumeMock(useTicketCountPerTag)

describe('<AllUsedTagsTable />', () => {
    const defaultState = {} as RootState
    const tag = tags[0]
    const someDateTimes = ['2024-05-01', '2024-05-02', '2024-05-03']
    const granularity = ReportingGranularity.Day
    const exampleDataRow = {
        tagId: String(tag.id),
        tag: tag,
        total: 123,
        timeSeries: [
            {
                dateTime: '2024-05-01',
                value: 100,
                label: '2024-05-01',
            },
            {
                dateTime: '2024-05-02',
                value: 23,
                label: '2024-05-02',
            },
            {
                dateTime: '2024-05-02',
                value: 0,
                label: '2024-05-02',
            },
        ],
    }
    const anotherExampleDataRow = {
        tagId: String(tag.id),
        tag: tag,
        total: 123,
        timeSeries: [
            {
                dateTime: '2024-05-01',
                value: 50,
                label: '2024-05-01',
            },
            {
                dateTime: '2024-05-02',
                value: 23,
                label: '2024-05-02',
            },
            {
                dateTime: '2024-05-02',
                value: 0,
                label: '2024-05-02',
            },
        ],
    }
    const grandTotal = 196
    const columnTotals = [150, 46, 0]

    beforeEach(() => {
        useNewStatsFiltersMock.mockReturnValue({
            cleanStatsFilters: defaultStatsFilters,
            granularity,
            userTimezone: 'UTC',
            isAnalyticsNewFilters: true,
        })
        useTicketCountPerTagMock.mockReturnValue({
            data: [exampleDataRow, anotherExampleDataRow],
            grandTotal,
            columnTotals,
            dateTimes: someDateTimes,
            isLoading: false,
            order: {
                column: 'tag',
                direction: OrderDirection.Desc,
            },
            setOrdering: jest.fn(),
        })
    })

    it('should render a table with tag data', () => {
        renderWithStore(
            <AllUsedTagsTable
                heatmapMode={false}
                valueMode={ValueMode.TotalCount}
            />,
            defaultState
        )

        expect(screen.getByText(TAG_COLUMN_LABEL)).toBeInTheDocument()
    })

    it('should render loading skeletons', () => {
        useTicketCountPerTagMock.mockReturnValue({
            data: [exampleDataRow, exampleDataRow],
            grandTotal,
            columnTotals,
            dateTimes: someDateTimes,
            isLoading: true,
            order: {
                column: 'tag',
                direction: OrderDirection.Desc,
            },
            setOrdering: jest.fn(),
        })

        renderWithStore(
            <AllUsedTagsTable
                heatmapMode={false}
                valueMode={ValueMode.TotalCount}
            />,
            defaultState
        )

        expect(document.querySelector('.skeleton')).toBeInTheDocument()
    })

    it('should render heatmap mode', () => {
        renderWithStore(
            <AllUsedTagsTable
                heatmapMode={true}
                valueMode={ValueMode.TotalCount}
            />,
            defaultState
        )

        expect(document.querySelector('.heatmap')).toBeInTheDocument()
    })

    it('should render percentage mode', () => {
        const percentageValue = calculatePercentage(
            exampleDataRow.timeSeries[0].value,
            columnTotals[0]
        )
        renderWithStore(
            <AllUsedTagsTable
                heatmapMode={false}
                valueMode={ValueMode.Percentage}
            />,
            defaultState
        )

        expect(
            screen.getByText(
                formatMetricValue(percentageValue, 'percent-refined')
            )
        ).toBeInTheDocument()
    })

    it('should render with pagination', () => {
        useTicketCountPerTagMock.mockReturnValue({
            data: new Array(16).fill(exampleDataRow),
            grandTotal: 16 * grandTotal,
            columnTotals: [16 * 100, 16 * 23, 0],
            dateTimes: someDateTimes,
            isLoading: false,
            order: {
                column: 'tag',
                direction: OrderDirection.Desc,
            },
            setOrdering: jest.fn(),
        })

        renderWithStore(
            <AllUsedTagsTable
                heatmapMode={false}
                valueMode={ValueMode.TotalCount}
            />,
            defaultState
        )

        const nextPageButton = screen.getByText('keyboard_arrow_right')
        expect(nextPageButton).toBeInTheDocument()
    })

    it.each([
        TOTAL_COLUMN_LABEL,
        TAG_COLUMN_LABEL,
        formatDates(granularity, someDateTimes[0]),
    ])('should allow column sorting', (columnHeader) => {
        const sortingCallbackSpy = jest.fn()
        useTicketCountPerTagMock.mockReturnValue({
            data: [exampleDataRow],
            grandTotal: 123,
            columnTotals: [100, 23, 0],
            dateTimes: someDateTimes,
            isLoading: false,
            order: {
                column: 'tag',
                direction: OrderDirection.Asc,
            },
            setOrdering: sortingCallbackSpy,
        })

        renderWithStore(
            <AllUsedTagsTable
                heatmapMode={false}
                valueMode={ValueMode.TotalCount}
            />,
            defaultState
        )
        userEvent.click(screen.getByText(columnHeader))

        expect(sortingCallbackSpy).toHaveBeenCalled()
    })

    describe('scrolling', () => {
        it('should handle table scrolling', async () => {
            renderWithStore(
                <AllUsedTagsTable
                    heatmapMode={false}
                    valueMode={ValueMode.TotalCount}
                />,
                {}
            )
            act(() => {
                const tableRow = document.getElementsByClassName('container')[0]
                fireEvent.scroll(tableRow, {target: {scrollLeft: 50}})
            })

            await waitFor(() => {
                expect(screen.getAllByRole('cell')[0]).toHaveClass('withShadow')
            })
        })

        it('should handle table scrolling to the left border', async () => {
            renderWithStore(
                <AllUsedTagsTable
                    heatmapMode={false}
                    valueMode={ValueMode.TotalCount}
                />,
                {}
            )
            act(() => {
                const tableRow = document.getElementsByClassName('container')[0]
                fireEvent.scroll(tableRow, {target: {scrollLeft: 0}})
            })

            await waitFor(() => {
                expect(screen.getAllByRole('cell')[0]).not.toHaveClass(
                    'withShadow'
                )
            })
        })
    })
})
