import React from 'react'

import { fireEvent, render, screen } from '@testing-library/react'
import { fromJS } from 'immutable'

import { logEvent, SegmentEvent } from 'common/segment'
import useAppDispatch from 'hooks/useAppDispatch'
import { getCustomerHistory, getLoading } from 'state/customers/selectors'
import { toggleHistory } from 'state/ticket/actions'
import { getDisplayHistory, getTicketState } from 'state/ticket/selectors'
import { getContext } from 'state/widgets/selectors'
import { WidgetEnvironment } from 'state/widgets/types'
import { assumeMock } from 'utils/testing'

import { CustomerTimelineWidget } from '../CustomerTimelineWidget'

jest.mock('common/segment', () => ({
    ...jest.requireActual('common/segment'),
    logEvent: jest.fn(),
}))
jest.mock('hooks/useAppDispatch')
jest.mock('state/ticket/actions', () => ({
    ...jest.requireActual('state/ticket/actions'),
    toggleHistory: jest.fn(),
}))
jest.mock('hooks/useAppSelector', () => (fn: () => unknown) => fn())
jest.mock('state/customers/selectors', () => ({
    ...jest.requireActual('state/customers/selectors'),
    getCustomerHistory: jest.fn(),
    getLoading: jest.fn(),
}))
jest.mock('state/ticket/selectors', () => ({
    ...jest.requireActual('state/ticket/selectors'),
    getTicketState: jest.fn(),
    getDisplayHistory: jest.fn(),
}))
jest.mock('state/widgets/selectors', () => ({
    ...jest.requireActual('state/widgets/selectors'),
    getContext: jest.fn(),
}))

const logEventMock = assumeMock(logEvent)
const useAppDispatchMock = assumeMock(useAppDispatch)
const toggleHistoryMock = assumeMock(toggleHistory)
const getCustomerHistoryMock = assumeMock(getCustomerHistory)
const getLoadingMock = assumeMock(getLoading)
const getDisplayHistoryMock = assumeMock(getDisplayHistory)
const getTicketStateMock = assumeMock(getTicketState)
const getContextMock = assumeMock(getContext)

describe('CustomerTimelineButton', () => {
    const dispatchMock = jest.fn()
    const closedTickets = [
        { id: 1, status: 'closed' },
        { id: 2, status: 'closed' },
        { id: 3, status: 'closed', snooze_datetime: '3070-01-01T00:00:00Z' },
    ]
    const openTickets = [
        { id: 3, status: 'open' },
        { id: 4, status: 'open' },
    ]
    beforeEach(() => {
        jest.resetAllMocks()
        useAppDispatchMock.mockReturnValue(dispatchMock)
        getDisplayHistoryMock.mockReturnValue(true)
        getContextMock.mockReturnValue(WidgetEnvironment.Ticket)
        getTicketStateMock.mockReturnValue(fromJS({}))
        getLoadingMock.mockReturnValue(fromJS({ history: false }))
        getCustomerHistoryMock.mockReturnValue(
            fromJS({
                tickets: [...closedTickets, ...openTickets],
                triedLoading: true,
            }),
        )
    })

    it('should display a loading spinner when history is loading', () => {
        getLoadingMock.mockReturnValue(fromJS({ history: true }))

        render(<CustomerTimelineWidget isEditing={false} />)

        expect(screen.getByRole('status')).toBeInTheDocument()
    })

    it('should dispatch toggleHistory with correct value when clicked', () => {
        const { rerender } = render(
            <CustomerTimelineWidget isEditing={false} />,
        )
        fireEvent.click(screen.getByRole('button'))

        expect(toggleHistoryMock).toHaveBeenCalledWith(false)
        expect(dispatchMock).toHaveBeenCalledTimes(1)

        getDisplayHistoryMock.mockReturnValue(false)
        rerender(<CustomerTimelineWidget isEditing={false} />)
        fireEvent.click(screen.getByRole('button'))

        expect(toggleHistoryMock).toHaveBeenCalledWith(true)
        expect(dispatchMock).toHaveBeenCalledTimes(2)
    })

    it('should log correct values when clicked', () => {
        const { rerender } = render(
            <CustomerTimelineWidget isEditing={false} />,
        )
        fireEvent.click(screen.getByRole('button'))
        expect(logEventMock).toHaveBeenCalledWith(
            SegmentEvent.UserHistoryToggled,
            {
                open: false,
                nbOfTicketsInTimeline: 5,
                nbOfMessagesInTicket: 0,
            },
        )

        getTicketStateMock.mockReturnValue(fromJS({ messages: [{ id: '1' }] }))
        rerender(<CustomerTimelineWidget isEditing={false} />)
        fireEvent.click(screen.getByRole('button'))

        expect(logEventMock).toHaveBeenCalledWith(
            SegmentEvent.UserHistoryToggled,
            {
                open: false,
                nbOfTicketsInTimeline: 5,
                nbOfMessagesInTicket: 1,
            },
        )
    })

    it('should display that there is no history', () => {
        getCustomerHistoryMock.mockReturnValue(
            fromJS({ tickets: [], triedLoading: true }),
        )

        const { rerender } = render(
            <CustomerTimelineWidget isEditing={false} />,
        )

        expect(screen.getByText('No other tickets')).toBeInTheDocument()

        getCustomerHistoryMock.mockReturnValue(
            fromJS({ tickets: [closedTickets[0]], triedLoading: true }),
        )

        rerender(<CustomerTimelineWidget isEditing={false} />)
        expect(screen.getByText('No other tickets')).toBeInTheDocument()
    })

    it('should display the correct number of tickets', () => {
        render(<CustomerTimelineWidget isEditing={false} />)

        expect(screen.getByText(/2 open/i)).toBeInTheDocument()
        expect(screen.getByText(/1 snoozed/i)).toBeInTheDocument()
        expect(screen.getByText(/5 tickets/i)).toBeInTheDocument()
    })

    describe('Customer context or edit mode', () => {
        it('should display a message when there are no tickets', () => {
            getContextMock.mockReturnValue(WidgetEnvironment.Customer)
            getCustomerHistoryMock.mockReturnValue(
                fromJS({ tickets: [], triedLoading: true }),
            )

            render(<CustomerTimelineWidget isEditing={false} />)

            expect(
                screen.getByText(/doesn’t have any tickets yet/i),
            ).toBeInTheDocument()
        })

        it('should display that there is only 1 ticket', () => {
            getContextMock.mockReturnValue(WidgetEnvironment.Customer)
            getCustomerHistoryMock.mockReturnValue(
                fromJS({ tickets: [closedTickets[0]], triedLoading: true }),
            )

            render(<CustomerTimelineWidget isEditing={false} />)

            expect(screen.getByText('1 ticket')).toBeInTheDocument()
        })

        it('should not display any button but a forum icon', () => {
            getContextMock.mockReturnValue(WidgetEnvironment.Customer)
            const { rerender } = render(
                <CustomerTimelineWidget isEditing={false} />,
            )
            expect(screen.queryByRole('button')).toBeNull()

            getContextMock.mockReturnValue(WidgetEnvironment.Ticket)
            rerender(<CustomerTimelineWidget isEditing={true} />)
            expect(screen.queryByRole('button')).toBeNull()

            expect(screen.getByText(/forum/i)).toBeInTheDocument()
        })
    })
})
