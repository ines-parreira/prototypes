import { assumeMock } from '@repo/testing'
import { fireEvent, render, screen } from '@testing-library/react'
import { useParams } from 'react-router-dom'

import { Button } from '@gorgias/axiom'
import { TicketCompact } from '@gorgias/helpdesk-types'

import useAppDispatch from 'hooks/useAppDispatch'
import history from 'pages/history'
import { getContext } from 'state/widgets/selectors'
import { WidgetEnvironment } from 'state/widgets/types'
import { TIMELINE_SEARCH_PARAM } from 'timeline/constants'
import { useTicketList } from 'timeline/hooks/useTicketList'
import { useTimelinePanel } from 'timeline/hooks/useTimelinePanel'
import { useTrackTimelineToggle } from 'timeline/hooks/useTrackTimelineToggle'

import { CustomerTimelineWidget } from '../CustomerTimelineWidget'

jest.mock('pages/history', () => ({
    replace: jest.fn(),
}))
jest.mock('@gorgias/axiom', () => ({
    ...jest.requireActual('@gorgias/axiom'),
    Button: jest.fn(({ onClick, children }) => (
        <button onClick={onClick}>{children}</button>
    )),
}))
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: jest.fn(),
}))
jest.mock('hooks/useAppDispatch')
jest.mock('hooks/useAppSelector', () => jest.fn((selector) => selector()))
jest.mock('state/widgets/selectors', () => ({
    ...jest.requireActual('state/widgets/selectors'),
    getContext: jest.fn(),
}))
jest.mock('timeline/hooks/useTimelineData', () => ({
    useTimelineData: jest.fn(),
}))
jest.mock('timeline/hooks/useTicketList', () => ({
    useTicketList: jest.fn(),
}))
jest.mock('timeline/hooks/useTimelinePanel', () => ({
    useTimelinePanel: jest.fn(),
}))
jest.mock('timeline/hooks/useTrackTimelineToggle')

const useAppDispatchMock = assumeMock(useAppDispatch)
const getContextMock = assumeMock(getContext)
const useTicketListDataMock = assumeMock(useTicketList)
const useTimelinePanelMock = assumeMock(useTimelinePanel)
const useParamsMock = assumeMock(useParams)

describe('CustomerTimelineButton', () => {
    const dispatchMock = jest.fn()
    const closedTickets = [
        { id: 1, status: 'closed' },
        { id: 2, status: 'closed' },
        { id: 3, status: 'closed', snooze_datetime: '3070-01-01T00:00:00Z' },
    ] as TicketCompact[]
    const openTickets = [
        { id: 3, status: 'open' },
        { id: 4, status: 'open' },
    ] as TicketCompact[]

    const tickets = [...closedTickets, ...openTickets]

    const defaultProps = {
        isEditing: false,
        shopperId: 1,
    }

    const openTimelineMock = jest.fn()
    const closeTimelineMock = jest.fn()

    const defaultTimelinePanelReturnValue = {
        isOpen: false,
        shopperId: null,
        openTimeline: openTimelineMock,
        closeTimeline: closeTimelineMock,
    }

    const defaultTimelineDataReturnValue = {
        isLoading: false,
        isError: false,
        tickets,
    }

    beforeEach(() => {
        useAppDispatchMock.mockReturnValue(dispatchMock)
        getContextMock.mockReturnValue(WidgetEnvironment.Ticket)
        useTimelinePanelMock.mockReturnValue(defaultTimelinePanelReturnValue)
        useTicketListDataMock.mockReturnValue(defaultTimelineDataReturnValue)
        useParamsMock.mockReturnValue({
            ticketId: '1',
        })
    })

    it('should display a loading spinner when history is loading', () => {
        useTicketListDataMock.mockReturnValue({
            ...defaultTimelineDataReturnValue,
            isLoading: true,
        })

        render(<CustomerTimelineWidget {...defaultProps} />)

        expect(screen.getByRole('status')).toBeInTheDocument()
    })

    it('should call the useTrackTimelineToggle hook', () => {
        render(<CustomerTimelineWidget {...defaultProps} />)
        expect(useTrackTimelineToggle).toHaveBeenCalled()
    })

    it('should call useTimelineData with shopperId', () => {
        render(<CustomerTimelineWidget {...defaultProps} />)
        expect(useTicketList).toHaveBeenCalledWith(defaultProps.shopperId)
    })

    it('should toggle timeline with correct customerId when clicked', () => {
        const { rerender } = render(
            <CustomerTimelineWidget {...defaultProps} />,
        )
        fireEvent.click(screen.getByRole('button'))

        expect(openTimelineMock).toHaveBeenCalledWith(defaultProps.shopperId)

        useTimelinePanelMock.mockReturnValue({
            ...defaultTimelinePanelReturnValue,
            isOpen: true,
            shopperId: defaultProps.shopperId,
        })
        rerender(<CustomerTimelineWidget {...defaultProps} />)
        fireEvent.click(screen.getByRole('button'))

        expect(closeTimelineMock).toHaveBeenCalled()
    })

    it('should display that there is no history', () => {
        useTicketListDataMock.mockReturnValue({
            ...defaultTimelineDataReturnValue,
            tickets: [],
        })

        const { rerender } = render(
            <CustomerTimelineWidget {...defaultProps} />,
        )

        expect(screen.getByText('No other tickets')).toBeInTheDocument()

        useTicketListDataMock.mockReturnValue({
            ...defaultTimelineDataReturnValue,
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

    it('should display a secondary button when there is only one open ticket which is the active ticket', () => {
        useTicketListDataMock.mockReturnValue({
            ...defaultTimelineDataReturnValue,
            tickets: [openTickets[0]],
        })
        useParamsMock.mockReturnValue({
            ticketId: openTickets[0].id.toString(),
        })

        render(<CustomerTimelineWidget {...defaultProps} />)

        expect(Button).toHaveBeenCalledWith(
            expect.objectContaining({
                intent: 'secondary',
            }),
            {},
        )
    })

    it('should call history.replace when the widget is unmounted with same customerId as opened timeline', () => {
        window.location.search = `?${TIMELINE_SEARCH_PARAM}=${defaultProps.shopperId}`
        const { unmount } = render(<CustomerTimelineWidget {...defaultProps} />)

        unmount()

        expect(history.replace).toHaveBeenCalledWith({
            search: ``,
        })
    })

    describe('when another timeline is open', () => {
        it('should display a forum icon', () => {
            useTimelinePanelMock.mockReturnValue({
                ...defaultTimelinePanelReturnValue,
                isOpen: true,
                shopperId: defaultProps.shopperId + 1,
            })
            render(<CustomerTimelineWidget {...defaultProps} />)
            expect(Button).toHaveBeenCalledWith(
                expect.objectContaining({
                    leadingIcon: 'forum',
                }),
                {},
            )
        })

        it('should display the correct text', () => {
            useTimelinePanelMock.mockReturnValue({
                ...defaultTimelinePanelReturnValue,
                isOpen: true,
                shopperId: defaultProps.shopperId + 1,
            })
            render(<CustomerTimelineWidget {...defaultProps} />)
            expect(screen.getByText(/open this/i)).toBeInTheDocument()
        })

        it('should open timeline with correct customerId on button click', () => {
            useTimelinePanelMock.mockReturnValue({
                ...defaultTimelinePanelReturnValue,
                isOpen: true,
                shopperId: defaultProps.shopperId + 1,
            })
            render(<CustomerTimelineWidget {...defaultProps} />)
            fireEvent.click(screen.getByRole('button'))
            expect(openTimelineMock).toHaveBeenCalledWith(
                defaultProps.shopperId,
            )
        })
    })

    describe('Customer context or edit mode', () => {
        it('should display a message when there are no tickets', () => {
            getContextMock.mockReturnValue(WidgetEnvironment.Customer)
            useTicketListDataMock.mockReturnValue({
                ...defaultTimelineDataReturnValue,
                tickets: [],
            })

            render(<CustomerTimelineWidget {...defaultProps} />)

            expect(
                screen.getByText(/doesn’t have any tickets yet/i),
            ).toBeInTheDocument()
        })

        it('should display that there is only 1 ticket', () => {
            getContextMock.mockReturnValue(WidgetEnvironment.Customer)
            useTicketListDataMock.mockReturnValue({
                ...defaultTimelineDataReturnValue,
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

    describe('Candu target attribute', () => {
        it('should be set to true when there is history', () => {
            render(<CustomerTimelineWidget {...defaultProps} />)
            expect(Button).toHaveBeenCalledWith(
                expect.objectContaining({
                    'data-candu-trigger-timeline': true,
                }),
                {},
            )
        })

        it('should be set to false when there is no history', () => {
            useTicketListDataMock.mockReturnValue({
                ...defaultTimelineDataReturnValue,
                tickets: [],
            })
            render(<CustomerTimelineWidget {...defaultProps} />)
            expect(Button).toHaveBeenCalledWith(
                expect.objectContaining({
                    'data-candu-trigger-timeline': false,
                }),
                {},
            )
        })
    })
})
