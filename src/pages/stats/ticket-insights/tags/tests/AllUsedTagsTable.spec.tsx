import {act, fireEvent, screen, waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
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

    beforeEach(() => {
        useNewStatsFiltersMock.mockReturnValue({
            cleanStatsFilters: defaultStatsFilters,
            granularity,
            userTimezone: 'UTC',
            isAnalyticsNewFilters: true,
        })
        useTicketCountPerTagMock.mockReturnValue({
            data: [exampleDataRow],
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
        renderWithStore(<AllUsedTagsTable />, defaultState)

        expect(screen.getByText(TAG_COLUMN_LABEL)).toBeInTheDocument()
    })

    it('should render loading skeletons', () => {
        useTicketCountPerTagMock.mockReturnValue({
            data: [exampleDataRow],
            dateTimes: someDateTimes,
            isLoading: true,
            order: {
                column: 'tag',
                direction: OrderDirection.Desc,
            },
            setOrdering: jest.fn(),
        })

        renderWithStore(<AllUsedTagsTable />, defaultState)

        expect(document.querySelector('.skeleton')).toBeInTheDocument()
    })

    it('should render with pagination', () => {
        useTicketCountPerTagMock.mockReturnValue({
            data: new Array(16).fill(exampleDataRow),
            dateTimes: someDateTimes,
            isLoading: false,
            order: {
                column: 'tag',
                direction: OrderDirection.Desc,
            },
            setOrdering: jest.fn(),
        })

        renderWithStore(<AllUsedTagsTable />, defaultState)

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
            dateTimes: someDateTimes,
            isLoading: false,
            order: {
                column: 'tag',
                direction: OrderDirection.Asc,
            },
            setOrdering: sortingCallbackSpy,
        })

        renderWithStore(<AllUsedTagsTable />, defaultState)
        userEvent.click(screen.getByText(columnHeader))

        expect(sortingCallbackSpy).toHaveBeenCalled()
    })

    describe('scrolling', () => {
        it('should handle table scrolling', async () => {
            renderWithStore(<AllUsedTagsTable />, {})
            act(() => {
                const tableRow = document.getElementsByClassName('container')[0]
                fireEvent.scroll(tableRow, {target: {scrollLeft: 50}})
            })

            await waitFor(() => {
                expect(screen.getAllByRole('cell')[0]).toHaveClass('withShadow')
            })
        })

        it('should handle table scrolling to the left border', async () => {
            renderWithStore(<AllUsedTagsTable />, {})
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
