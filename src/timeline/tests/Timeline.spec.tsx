import { act, fireEvent, render, screen } from '@testing-library/react'

import { TicketCompact } from '@gorgias/api-queries'

import { logEvent, SegmentEvent } from 'common/segment'
import { assumeMock, getLastMockCall } from 'utils/testing'

import { useTimelineData } from '../hooks/useTimelineData'
import { RangeFilter } from '../RangeFilter'
import TicketCard from '../TicketCard'
import Timeline from '../Timeline'

jest.mock('common/segment', () => ({
    logEvent: jest.fn(),
    SegmentEvent: {
        CustomerTimelineTicketClicked: 'CustomerTimelineTicketClicked',
    },
}))

jest.mock('../hooks/useTimelineData', () => ({
    useTimelineData: jest.fn(),
}))
jest.mock('../TicketCard', () => jest.fn(() => <div>TicketCard</div>))
jest.mock('../DisplayedDate', () => jest.fn(() => 'Mocked DatetimeLabel'))
jest.mock('../RangeFilter', () => ({
    RangeFilter: jest.fn(() => <div>RangeFilter</div>),
}))

const TicketCardMock = assumeMock(TicketCard)
const rangeFilterMock = assumeMock(RangeFilter)
const useTimelineDataMock = assumeMock(useTimelineData)

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
        tickets: [ticket1, ticket2, ticket3],
    }
    beforeEach(() => {
        useTimelineDataMock.mockReturnValue(defaultTimelineReturnValue)
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

    it('should call TicketCard for each ticket with a channel, in correct order, with correct props', () => {
        const ticketId = 3
        render(<Timeline ticketId={ticketId} shopperId={null} />)

        expect(TicketCard).toHaveBeenCalledTimes(2)
        expect(TicketCard).toHaveBeenNthCalledWith(
            1,
            {
                className: expect.any(String),
                isHighlighted: false,
                ticket: ticket1,
                displayedDate: 'Mocked DatetimeLabel',
            },
            {},
        )
        expect(TicketCard).toHaveBeenNthCalledWith(
            2,
            {
                className: expect.any(String),
                isHighlighted: true,
                ticket: ticket3,
                displayedDate: 'Mocked DatetimeLabel',
            },
            {},
        )
    })

    it('should log event and redirect when Link is clicked', () => {
        render(<Timeline shopperId={null} />)

        const link = screen.getAllByText('TicketCard')[0].parentElement
        link?.click()
        expect(logEvent).toHaveBeenCalledWith(
            SegmentEvent.CustomerTimelineTicketClicked,
        )
        expect(link).toHaveAttribute('to', '/app/ticket/1')
    })

    describe('Empty state', () => {
        it('should say that they are no tickets yet', () => {
            useTimelineDataMock.mockReturnValue({
                ...defaultTimelineReturnValue,
                tickets: [],
            })

            render(<Timeline shopperId={null} />)

            expect(
                screen.getByText('This customer doesn’t have any tickets yet.'),
            ).toBeInTheDocument()
        })

        it('should say that there are no matching tickets', () => {
            render(<Timeline shopperId={null} />)

            fireEvent.click(screen.getByText('All'))
            fireEvent.click(screen.getByText('Closed'))
            fireEvent.click(screen.getByText('Open'))

            expect(screen.getByText('No matching tickets')).toBeInTheDocument()
        })
    })

    describe('Sorting and filtering', () => {
        it('should should correctly filter tickets by range', () => {
            render(<Timeline shopperId={null} />)

            TicketCardMock.mockClear()

            act(() => {
                getLastMockCall(rangeFilterMock)[0].setRangeFilter({
                    start: new Date('2025-01-01').getTime(),
                    end: new Date('2025-01-02').getTime(),
                })
            })

            expect(TicketCardMock).toHaveBeenCalledTimes(0)
        })

        it('should should correctly filter tickets by status', () => {
            render(<Timeline shopperId={null} />)

            TicketCardMock.mockClear()

            fireEvent.click(screen.getByText('All'))
            fireEvent.click(screen.getByText('Closed'))

            expect(TicketCardMock).toHaveBeenCalledTimes(1)
            expect(TicketCardMock.mock.calls[0][0].ticket).toEqual(ticket1)

            TicketCardMock.mockClear()

            fireEvent.click(screen.getByText('Closed'))
            expect(TicketCardMock).toHaveBeenCalledTimes(2)
            expect(TicketCardMock.mock.calls[0][0].ticket).toEqual(ticket1)
            expect(TicketCardMock.mock.calls[1][0].ticket).toEqual(ticket3)
        })

        it('should call sort tickets when a SelectField option is clicked', () => {
            render(<Timeline shopperId={null} />)

            TicketCardMock.mockClear()

            fireEvent.click(screen.getByRole('combobox'))
            fireEvent.click(
                screen.getByRole('option', { name: 'arrow_upward Created' }),
            )

            expect(TicketCardMock.mock.calls[0][0].ticket).toEqual(ticket3)
            expect(TicketCardMock.mock.calls[1][0].ticket).toEqual(ticket1)
        })
    })
})
