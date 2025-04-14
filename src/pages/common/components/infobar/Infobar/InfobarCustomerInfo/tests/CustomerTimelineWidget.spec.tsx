import { fireEvent, render, screen } from '@testing-library/react'

import { TicketSummary } from '@gorgias/api-types'

import useAppDispatch from 'hooks/useAppDispatch'
import { useTimeline } from 'pages/common/components/timeline/hooks/useTimeline'
import { getContext } from 'state/widgets/selectors'
import { WidgetEnvironment } from 'state/widgets/types'
import { assumeMock } from 'utils/testing'

import { CustomerTimelineWidget } from '../CustomerTimelineWidget'

jest.mock('hooks/useAppDispatch')
jest.mock('hooks/useAppSelector', () => jest.fn((selector) => selector()))
jest.mock('state/widgets/selectors', () => ({
    ...jest.requireActual('state/widgets/selectors'),
    getContext: jest.fn(),
}))
jest.mock('pages/common/components/timeline/hooks/useTimeline', () => ({
    useTimeline: jest.fn(),
}))

const useAppDispatchMock = assumeMock(useAppDispatch)
const getContextMock = assumeMock(getContext)
const useTimelineMock = assumeMock(useTimeline)

describe('CustomerTimelineButton', () => {
    const dispatchMock = jest.fn()
    const closedTickets = [
        { id: 1, status: 'closed' },
        { id: 2, status: 'closed' },
        { id: 3, status: 'closed', snooze_datetime: '3070-01-01T00:00:00Z' },
    ] as TicketSummary[]
    const openTickets = [
        { id: 3, status: 'open' },
        { id: 4, status: 'open' },
    ] as TicketSummary[]

    const tickets = [...closedTickets, ...openTickets]

    const defaultProps = {
        isEditing: false,
        customerId: 1,
    }

    const openTimelineMock = jest.fn()
    const closeTimelineMock = jest.fn()

    const defaultTimelineReturnValue = {
        isOpen: false,
        timelineShopperId: null,
        isLoading: false,
        hasTriedLoading: true,
        tickets,
        openTimeline: openTimelineMock,
        closeTimeline: closeTimelineMock,
    }

    beforeEach(() => {
        useAppDispatchMock.mockReturnValue(dispatchMock)
        getContextMock.mockReturnValue(WidgetEnvironment.Ticket)
        useTimelineMock.mockReturnValue(defaultTimelineReturnValue)
    })

    it('should display a loading spinner when history is loading', () => {
        useTimelineMock.mockReturnValue({
            ...defaultTimelineReturnValue,
            isLoading: true,
        })

        render(<CustomerTimelineWidget {...defaultProps} />)

        expect(screen.getByRole('status')).toBeInTheDocument()
    })

    it('should toggle timeline with correct customerId when clicked', () => {
        const { rerender } = render(
            <CustomerTimelineWidget {...defaultProps} />,
        )
        fireEvent.click(screen.getByRole('button'))

        expect(openTimelineMock).toHaveBeenCalledWith(defaultProps.customerId)

        useTimelineMock.mockReturnValue({
            ...defaultTimelineReturnValue,
            isOpen: true,
            timelineShopperId: String(defaultProps.customerId),
        })
        rerender(<CustomerTimelineWidget {...defaultProps} />)
        fireEvent.click(screen.getByRole('button'))

        expect(closeTimelineMock).toHaveBeenCalled()
    })

    it('should display that there is no history', () => {
        useTimelineMock.mockReturnValue({
            ...defaultTimelineReturnValue,
            tickets: [],
        })

        const { rerender } = render(
            <CustomerTimelineWidget {...defaultProps} />,
        )

        expect(screen.getByText('No other tickets')).toBeInTheDocument()

        useTimelineMock.mockReturnValue({
            ...defaultTimelineReturnValue,
            tickets: [closedTickets[0]],
        })

        rerender(<CustomerTimelineWidget {...defaultProps} />)
        expect(screen.getByText('No other tickets')).toBeInTheDocument()
    })

    it('should display the correct number of tickets', () => {
        render(<CustomerTimelineWidget {...defaultProps} />)

        expect(screen.getByText(/2 open/i)).toBeInTheDocument()
        expect(screen.getByText(/1 snoozed/i)).toBeInTheDocument()
        expect(screen.getByText(/5 tickets/i)).toBeInTheDocument()
    })

    describe('Customer context or edit mode', () => {
        it('should display a message when there are no tickets', () => {
            getContextMock.mockReturnValue(WidgetEnvironment.Customer)
            useTimelineMock.mockReturnValue({
                ...defaultTimelineReturnValue,
                tickets: [],
            })

            render(<CustomerTimelineWidget {...defaultProps} />)

            expect(
                screen.getByText(/doesn’t have any tickets yet/i),
            ).toBeInTheDocument()
        })

        it('should display that there is only 1 ticket', () => {
            getContextMock.mockReturnValue(WidgetEnvironment.Customer)
            useTimelineMock.mockReturnValue({
                ...defaultTimelineReturnValue,
                tickets: [closedTickets[0]],
            })

            render(<CustomerTimelineWidget {...defaultProps} />)

            expect(screen.getByText('1 ticket')).toBeInTheDocument()
        })

        it('should not display any button but a forum icon', () => {
            getContextMock.mockReturnValue(WidgetEnvironment.Customer)
            const { rerender } = render(
                <CustomerTimelineWidget {...defaultProps} />,
            )
            expect(screen.queryByRole('button')).toBeNull()

            getContextMock.mockReturnValue(WidgetEnvironment.Ticket)
            rerender(
                <CustomerTimelineWidget {...defaultProps} isEditing={true} />,
            )
            expect(screen.queryByRole('button')).toBeNull()

            expect(screen.getByText(/forum/i)).toBeInTheDocument()
        })
    })
})
