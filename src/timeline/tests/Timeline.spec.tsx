import { act, fireEvent, render, screen } from '@testing-library/react'

import { TicketCompact } from '@gorgias/helpdesk-queries'

import { logEvent, SegmentEvent } from 'common/segment'
import { useFlag } from 'core/flags'
import { useModalShortcuts } from 'timeline/ticket-modal/hooks/useModalShortcuts'
import { assumeMock, getLastMockCall } from 'utils/testing'

import { useTimelineData } from '../hooks/useTimelineData'
import { RangeFilter } from '../RangeFilter'
import { TicketModal } from '../ticket-modal/components/TicketModal'
import { useTicketModal } from '../ticket-modal/hooks/useTicketModal'
import TicketCard from '../TicketCard'
import Timeline from '../Timeline'

jest.mock('core/flags', () => ({
    useFlag: jest.fn(),
}))
jest.mock('core/flags/hooks/useFlag', () => jest.fn())
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
jest.mock('../ticket-modal/components/TicketModal', () => ({
    TicketModal: jest.fn(() => <div>TicketModal</div>),
}))
jest.mock('../ticket-modal/hooks/useTicketModal', () => ({
    useTicketModal: jest.fn(),
}))
jest.mock('../ticket-modal/hooks/useModalShortcuts', () => ({
    useModalShortcuts: jest.fn(),
}))

const TicketCardMock = assumeMock(TicketCard)
const rangeFilterMock = assumeMock(RangeFilter)
const useTimelineDataMock = assumeMock(useTimelineData)
const useFlagMock = assumeMock(useFlag)
const useTicketModalMock = assumeMock(useTicketModal)
const TicketModalMock = assumeMock(TicketModal)

describe('<Timeline />', () => {
    const useTicketModalReturnValue = {
        ticketId: null,
        onClose: jest.fn(),
        onNext: jest.fn(),
        onOpen: jest.fn(),
        onPrevious: jest.fn(),
    }
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
        useFlagMock.mockReturnValue(true)
        useTicketModalMock.mockReturnValue(useTicketModalReturnValue)
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
            useFlagMock.mockReturnValue(false)
            render(<Timeline shopperId={null} />)

            TicketCardMock.mockClear()

            fireEvent.click(screen.getByRole('combobox'))
            fireEvent.click(
                screen.getByRole('option', { name: 'arrow_upward Created' }),
            )

            expect(TicketCardMock.mock.calls[0][0].ticket).toEqual(ticket3)
            expect(TicketCardMock.mock.calls[1][0].ticket).toEqual(ticket1)
        })

        it('should call sort tickets when a dropdown option is clicked (drawer UX)', () => {
            useFlagMock.mockReturnValue(true)
            render(<Timeline shopperId={null} />)

            TicketCardMock.mockClear()

            // Click the sort button to open dropdown
            fireEvent.click(screen.getByRole('button', { name: /sort/i }))

            // Click on a sort option in the dropdown
            fireEvent.click(screen.getAllByText('Created')[0])

            expect(TicketCardMock.mock.calls[0][0].ticket).toEqual(ticket3)
            expect(TicketCardMock.mock.calls[1][0].ticket).toEqual(ticket1)
        })

        it('should render SelectField when hasCTDrawerUX is false', () => {
            useFlagMock.mockReturnValue(false)
            render(<Timeline shopperId={null} />)

            // Should render the SelectField combobox
            expect(screen.getByRole('combobox')).toBeInTheDocument()

            // Should not render the dropdown sort button
            expect(
                screen.queryByRole('button', { name: /sort/i }),
            ).not.toBeInTheDocument()
        })

        it('should render dropdown sort button when hasCTDrawerUX is true', () => {
            useFlagMock.mockReturnValue(true)
            render(<Timeline shopperId={null} />)

            // Should render the dropdown sort button
            expect(
                screen.getByRole('button', { name: /sort/i }),
            ).toBeInTheDocument()

            // Should not render the SelectField combobox
            expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
        })
    })

    describe('Modal', () => {
        it('should call useTicketModal with the correct props', () => {
            render(<Timeline shopperId={null} />)

            expect(useTicketModal).toHaveBeenCalledWith([1, 2, 3])
        })

        it('should log event and redirect when a ticket card is clicked', () => {
            useFlagMock.mockReturnValue(false)
            render(<Timeline shopperId={null} />)

            const card = screen.getAllByText('TicketCard')[0].parentElement
            card?.click()
            expect(logEvent).toHaveBeenCalledWith(
                SegmentEvent.CustomerTimelineTicketClicked,
            )
            expect(card).toHaveAttribute('to', '/app/ticket/1')
        })

        it('should log event and call modal.onOpen when a ticket card is clicked', () => {
            render(<Timeline shopperId={null} />)

            // Find the link that wraps the TicketCard
            const card = screen.getAllByText('TicketCard')[0].parentElement
            card?.click()

            expect(logEvent).toHaveBeenCalledWith(
                SegmentEvent.CustomerTimelineTicketClicked,
            )
            expect(useTicketModalReturnValue.onOpen).toHaveBeenCalledWith(1)
        })

        it('should call useModalShortcuts with the correct props', () => {
            render(<Timeline shopperId={null} />)

            expect(useModalShortcuts).toHaveBeenCalledWith(
                useTicketModalReturnValue,
            )
        })

        it('should not render TicketModal if useTicketModal returns no ticketId', () => {
            render(<Timeline shopperId={null} />)

            expect(TicketModalMock).not.toHaveBeenCalled()
        })

        it('should call TicketModal with the correct props if useTicketModal returns a ticketId', () => {
            useTicketModalMock.mockReturnValue({
                ...useTicketModalReturnValue,
                ticketId: 1,
            })

            render(<Timeline shopperId={null} />)

            expect(TicketModalMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    ...useTicketModalReturnValue,
                    ticketId: 1,
                }),
                {},
            )
        })
    })
})
