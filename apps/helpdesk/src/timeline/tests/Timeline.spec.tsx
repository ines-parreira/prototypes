import { assumeMock } from '@repo/testing'
import { render, screen } from '@testing-library/react'

import { TicketCompact } from '@gorgias/helpdesk-queries'

import { useFlag } from 'core/flags'
import * as timelineItem from 'timeline/helpers/timelineItem'
import { useTimelineData } from 'timeline/hooks/useTimelineData'

import Filters from '../filters/Filters'
import { useTimelineFilters } from '../filters/hooks/useTimelineFilters'
import { NoResults } from '../NoResults'
import { Sort } from '../Sort'
import { SortedTicketList } from '../SortedTicketList'
import Timeline from '../Timeline'

jest.mock('core/flags', () => ({
    useFlag: jest.fn(),
}))
jest.mock('core/flags/hooks/useFlag', () => jest.fn())

jest.mock('../hooks/useTimelineData', () => ({
    useTimelineData: jest.fn(),
}))
jest.mock('../TicketCard', () => jest.fn(() => <div>TicketCard</div>))
jest.mock('../filters/Filters', () => ({
    __esModule: true,
    default: jest.fn(() => <div>Filters</div>),
}))
jest.mock('../Sort', () => ({
    Sort: jest.fn(() => <div>Sort</div>),
}))
jest.mock('../SortedTicketList', () => ({
    SortedTicketList: jest.fn(() => <div>SortedTicketList</div>),
}))
jest.mock('../NoResults', () => ({
    NoResults: jest.fn(({ children }) => <div>NoResults: {children}</div>),
}))
jest.mock('../filters/hooks/useTimelineFilters', () => ({
    useTimelineFilters: jest.fn(),
}))

const FiltersMock = assumeMock(Filters)
const SortMock = assumeMock(Sort)
const SortedTicketListMock = assumeMock(SortedTicketList)
const NoResultsMock = assumeMock(NoResults)
const useTimelineDataMock = assumeMock(useTimelineData)
const useTimelineFiltersMock = assumeMock(useTimelineFilters)
const useFlagMock = assumeMock(useFlag)

describe('<Timeline />', () => {
    const ticket1 = {
        id: 1,
        created_datetime: '2024-01-02T03:04:05.123456+00:00',
        status: 'open',
        channel: 'email',
    } as TicketCompact
    const ticket2 = {
        id: 2,
        status: 'closed',
        created_datetime: '2023-01-02T03:04:05.123456+00:00',
    } as TicketCompact
    const ticket3 = {
        id: 3,
        created_datetime: '2022-01-02T03:04:05.123456+00:00',
        status: 'closed',
        channel: 'email',
    } as TicketCompact
    const defaultTimelineReturnValue = {
        isLoading: false,
        isError: false,
        items: [ticket1, ticket2, ticket3].map((v) =>
            timelineItem.fromTicket(v),
        ),
        enableOrdersInTimeline: false,
    }

    const defaultTimelineFiltersReturnValue = {
        activeFilters: {
            type: { ticket: true, order: true },
            status: { open: true, closed: true, snooze: true },
            sortOption: {
                order: 'desc' as const,
                key: 'last_message_datetime' as const,
                label: 'Last message' as const,
            },
        },
        selectedTypeKeys: ['ticket' as const, 'order' as const],
        selectedStatusKeys: [
            'open' as const,
            'closed' as const,
            'snooze' as const,
        ],
        setActiveFilters: jest.fn(),
        rangeFilter: { start: null, end: null },
        setRangeFilter: jest.fn(),
        setSortOption: jest.fn(),
        sortedTickets: [ticket1, ticket2, ticket3].map((v) =>
            timelineItem.fromTicket(v),
        ),
        sortOptions: [
            {
                order: 'desc' as const,
                key: 'last_message_datetime' as const,
                label: 'Last message' as const,
            },
            {
                order: 'asc' as const,
                key: 'created_datetime' as const,
                label: 'Created' as const,
            },
        ],
        sortOption: {
            order: 'desc' as const,
            key: 'last_message_datetime' as const,
            label: 'Last message' as const,
        },
    }

    beforeEach(() => {
        useTimelineDataMock.mockReturnValue(defaultTimelineReturnValue)
        useTimelineFiltersMock.mockReturnValue(
            defaultTimelineFiltersReturnValue,
        )
        useFlagMock.mockReturnValue(true)
    })

    it('should render loading spinner', () => {
        useTimelineDataMock.mockReturnValue({
            ...defaultTimelineReturnValue,
            isLoading: true,
        })

        render(<Timeline shopperId={null} />)

        expect(screen.getByRole('status')).toBeInTheDocument()
    })

    it('should call onLoaded when triedLoading is true and hasCalledOnLoaded is false', () => {
        const onLoaded = jest.fn()
        const { rerender } = render(
            <Timeline shopperId={null} onLoaded={onLoaded} />,
        )

        expect(onLoaded).toHaveBeenCalledTimes(1)

        // Should not call onLoaded again
        rerender(<Timeline onLoaded={onLoaded} shopperId={null} />)
        expect(onLoaded).toHaveBeenCalledTimes(1)
    })

    it('should call useCustomFieldDefinitions with correct params', () => {
        render(<Timeline shopperId={null} />)
    })

    it('should call useTimelineData with correct params', () => {
        const { rerender } = render(<Timeline shopperId={null} />)

        expect(useTimelineDataMock).toHaveBeenCalledWith(undefined)

        rerender(<Timeline shopperId={123} />)
        expect(useTimelineDataMock).toHaveBeenCalledWith(123)
    })

    it('should call SortedTicketList with correct props', () => {
        const ticketId = 3
        render(<Timeline ticketId={ticketId} shopperId={null} />)

        expect(SortedTicketListMock).toHaveBeenCalledWith(
            {
                ticketId: ticketId,
                sortedItems: defaultTimelineFiltersReturnValue.sortedTickets,
                sortOption: defaultTimelineFiltersReturnValue.sortOption,
                containerRef: undefined,
            },
            {},
        )
    })

    describe('Empty state', () => {
        it('should say that they are no tickets yet', () => {
            useTimelineDataMock.mockReturnValue({
                ...defaultTimelineReturnValue,
                items: [],
            })

            render(<Timeline shopperId={null} />)

            expect(NoResultsMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    children: expect.stringContaining('This customer'),
                }),
                expect.anything(),
            )
        })
    })

    describe('Filters and sorting', () => {
        it('should call Filters with correct props', () => {
            render(<Timeline shopperId={null} />)

            expect(FiltersMock).toHaveBeenCalledWith(
                {
                    isTypeFilterDisabled: false,
                    setActiveFilters:
                        defaultTimelineFiltersReturnValue.setActiveFilters,
                    setRangeFilter:
                        defaultTimelineFiltersReturnValue.setRangeFilter,
                    selectedTypeKeys:
                        defaultTimelineFiltersReturnValue.selectedTypeKeys,
                    selectedStatusKeys:
                        defaultTimelineFiltersReturnValue.selectedStatusKeys,
                    rangeFilter: defaultTimelineFiltersReturnValue.rangeFilter,
                },
                {},
            )
        })

        it('should call Sort with correct props', () => {
            render(<Timeline shopperId={null} />)

            expect(SortMock).toHaveBeenCalledWith(
                {
                    value: defaultTimelineFiltersReturnValue.sortOption,
                    onChange: defaultTimelineFiltersReturnValue.setSortOption,
                    sortOptions: defaultTimelineFiltersReturnValue.sortOptions,
                },
                {},
            )
        })

        it('should disable type filter when only orders are selected', () => {
            useTimelineFiltersMock.mockReturnValue({
                ...defaultTimelineFiltersReturnValue,
                activeFilters: {
                    ...defaultTimelineFiltersReturnValue.activeFilters,
                    type: { ticket: false, order: true },
                },
            })

            render(<Timeline shopperId={null} />)

            expect(FiltersMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    isTypeFilterDisabled: true,
                }),
                {},
            )
        })

        it('should render NoResults when no tickets match filters', () => {
            useTimelineFiltersMock.mockReturnValue({
                ...defaultTimelineFiltersReturnValue,
                sortedTickets: [],
            })

            render(<Timeline shopperId={null} />)

            expect(NoResultsMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    children: expect.arrayContaining([
                        expect.objectContaining({ type: 'b' }),
                        expect.objectContaining({ type: 'br' }),
                        'Try adjusting filters to get results',
                    ]),
                }),
                {},
            )
        })
    })

    describe('Integration', () => {
        it('should call useTimelineFilters with items from useTimelineData', () => {
            render(<Timeline shopperId={null} />)

            expect(useTimelineFiltersMock).toHaveBeenCalledWith({
                items: defaultTimelineReturnValue.items,
            })
        })

        it('should pass sorted tickets to SortedTicketList', () => {
            const customSortedTickets = [
                timelineItem.fromTicket(ticket2),
                timelineItem.fromTicket(ticket1),
            ]

            useTimelineFiltersMock.mockReturnValue({
                ...defaultTimelineFiltersReturnValue,
                sortedTickets: customSortedTickets,
            })

            render(<Timeline shopperId={null} />)

            expect(SortedTicketListMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    sortedItems: customSortedTickets,
                }),
                {},
            )
        })
    })
})
