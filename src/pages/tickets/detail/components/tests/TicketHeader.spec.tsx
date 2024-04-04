import React, {ComponentProps} from 'react'
import {render, fireEvent, waitFor} from '@testing-library/react'
import {fromJS} from 'immutable'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'
import _omit from 'lodash/omit'
import {useParams} from 'react-router-dom'
import moment from 'moment'

import {logEvent, SegmentEvent} from 'common/segment'
import {ticket} from 'fixtures/ticket'
import useElementSize from 'hooks/useElementSize'
import * as notificationsActions from 'state/notifications/actions'
import * as ticketActions from 'state/ticket/actions'
import {RootState} from 'state/types'
import {UserRole} from 'config/types/user'
import {user} from 'fixtures/users'
import {NotificationStatus} from 'state/notifications/types'
import {makeExecuteKeyboardAction} from 'utils/testing'
import shortcutManager from 'services/shortcutManager'
import useAppDispatch from 'hooks/useAppDispatch'
import TicketHeader from '../TicketHeader'
import Snooze from '../Snooze'

jest.mock('hooks/useElementSize', () => jest.fn())

const useElementSizeMock = useElementSize as jest.Mock
useElementSizeMock.mockReturnValue([0, 160])

jest.mock(
    'pages/tickets/detail/components/TicketDetails/TicketAssignee/TicketAssignee',
    () => () => <div>TicketAssigneeMock</div>
)

jest.mock('services/shortcutManager')

jest.mock('../TicketDetails/TicketTags', () => () => 'TicketTagsMock')

jest.mock('state/notifications/actions', () => ({
    notify: jest.fn(() => () => Promise.resolve()),
}))

jest.mock('state/ticket/actions', () => ({
    addTags: jest.fn(),
    clearTicket: jest.fn(),
    displayAuditLogEvents: jest.fn(),
    goToNextTicket: jest.fn(async (_ticketId, promise: Promise<any>) => {
        await Promise.resolve(promise)
    }),
    hideAuditLogEvents: jest.fn(),
    removeTag: jest.fn(),
    setAgent: jest.fn(),
    setSpam: jest.fn(),
    setStatus: jest.fn(),
    setSubject: jest.fn(() => () => Promise.resolve()),
    setTeam: jest.fn(),
    setTrashed: jest.fn(),
    snoozeTicket: jest.fn((_datime, callback?: () => void) => {
        callback?.()
    }),
    ticketPartialUpdate: jest.fn(() => () => Promise.resolve()),
    isTicketNavigationAvailable: jest.fn(),
}))

jest.mock('reactstrap', () => {
    const reactstrap: Record<string, unknown> = jest.requireActual('reactstrap')

    return {
        ...reactstrap,
        Popover: (props: Record<string, any>) => {
            return props.isOpen ? <div {...props}>{props.children}</div> : null
        },
    }
})

jest.mock('common/segment')

const mockMoment = moment

jest.mock('../Snooze', () => ({onUpdate}: ComponentProps<typeof Snooze>) => (
    <div onClick={() => onUpdate(mockMoment())}>Snooze</div>
))

const shortcutManagerMock = shortcutManager as jest.Mocked<
    typeof shortcutManager
>
const shortcutEventMock = {
    preventDefault: jest.fn(),
} as unknown as jest.Mocked<Event>

// mock Date object
const DATE_TO_USE = new Date('2017')
jest.spyOn(Date, 'now').mockImplementation(() => DATE_TO_USE.getTime())

const mockStore = configureMockStore([thunk])

jest.mock('hooks/useAppDispatch', () => jest.fn())
jest.mock('split-ticket-view-toggle/hooks/useSplitTicketView', () =>
    jest.fn().mockReturnValue([true])
)

jest.mock('react-router-dom', () => ({
    useParams: jest.fn(),
}))

const useParamsMock = useParams as jest.Mock

describe('<TicketHeader />', () => {
    const defaultStore: Partial<RootState> = {
        currentUser: fromJS(user),
        ticket: fromJS(_omit(ticket, 'id')),
    }

    const minProps = {
        className: '',
        ticket: fromJS(_omit(ticket, 'id')),
        hideTicket: () => Promise.resolve(),
        setStatus: jest.fn(),
    }

    let dispatch: jest.Mock
    const useAppDispatchMock = useAppDispatch as jest.Mock

    beforeEach(() => {
        dispatch = jest.fn()
        useAppDispatchMock.mockReturnValue(dispatch)
        useParamsMock.mockReturnValue({})
    })

    it('should render new ticket', () => {
        const {container} = render(
            <Provider store={mockStore(defaultStore)}>
                <TicketHeader {...minProps} />
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render existing ticket', () => {
        useAppDispatchMock.mockReturnValue(jest.fn(() => true))
        const {container, getByText} = render(
            <Provider
                store={mockStore({...defaultStore, ticket: fromJS(ticket)})}
            >
                <TicketHeader {...minProps} ticket={fromJS(ticket)} />
            </Provider>
        )

        expect(getByText('keyboard_arrow_left')).toBeInTheDocument()
        expect(getByText('keyboard_arrow_right')).toBeInTheDocument()

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render spam ticket', () => {
        const spamTicket = fromJS({...ticket, spam: true})
        const {container} = render(
            <Provider
                store={mockStore({
                    ...defaultStore,
                    ticket: spamTicket,
                })}
            >
                <TicketHeader {...minProps} ticket={spamTicket} />
            </Provider>
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render trashed ticket', () => {
        const trashedTicket = fromJS({...ticket, trashed_datetime: true})
        const {container} = render(
            <Provider
                store={mockStore({
                    ...defaultStore,
                    ticket: trashedTicket,
                })}
            >
                <TicketHeader {...minProps} ticket={trashedTicket} />
            </Provider>
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should mark a ticket as unread when clicking "Mark as unread" button', async () => {
        const readTicket = fromJS({...ticket, is_unread: false})
        const mockOnToggleUnread = jest.fn()

        const {getByText} = render(
            <Provider
                store={mockStore({
                    ...defaultStore,
                    ticket: readTicket,
                })}
            >
                <TicketHeader
                    {...minProps}
                    ticket={readTicket}
                    onToggleUnread={mockOnToggleUnread}
                />
            </Provider>
        )

        fireEvent.click(getByText(/more_vert/))
        fireEvent.click(getByText(/Mark as unread/))
        await waitFor(() => {
            expect(ticketActions.ticketPartialUpdate).toHaveBeenNthCalledWith(
                1,
                {
                    is_unread: true,
                }
            )
            expect(mockOnToggleUnread).toHaveBeenCalledWith(ticket.id, true)
            return expect(notificationsActions.notify).toHaveBeenNthCalledWith(
                1,
                {
                    message: 'Ticket has been marked as unread',
                    status: NotificationStatus.Success,
                }
            )
        })
    })

    it('should display the delete action for lead and admin agents', () => {
        const {getByText} = render(
            <Provider store={mockStore(defaultStore)}>
                <TicketHeader {...minProps} ticket={fromJS(ticket)} />
            </Provider>
        )

        fireEvent.click(getByText(/more_vert/))
        expect(getByText(/Delete/)).toBeTruthy()
    })

    it('should not display the delete action for basic, lite and observer agents', () => {
        const {getByText, queryByText} = render(
            <Provider
                store={mockStore({
                    ...defaultStore,
                    currentUser: fromJS({
                        ...user,
                        role: {
                            name: UserRole.LiteAgent,
                        },
                    }),
                })}
            >
                <TicketHeader {...minProps} ticket={fromJS(ticket)} />
            </Provider>
        )

        fireEvent.click(getByText(/more_vert/))

        expect(queryByText(/Delete/)).toBeFalsy()
    })

    it('should not register the shortcut of the delete action for basic, lite and observer agents', () => {
        const {queryByText} = render(
            <Provider
                store={mockStore({
                    ...defaultStore,
                    currentUser: fromJS({
                        ...user,
                        role: {
                            name: UserRole.LiteAgent,
                        },
                    }),
                })}
            >
                <TicketHeader {...minProps} ticket={fromJS(ticket)} />
            </Provider>
        )

        makeExecuteKeyboardAction(
            shortcutManagerMock,
            shortcutEventMock,
            'TicketDetailContainer'
        )('DELETE_TICKET')

        expect(queryByText(/You are about to /)).toBeFalsy()
    })

    it('should log segment event', () => {
        jest.useFakeTimers()

        const {getByText} = render(
            <Provider
                store={mockStore({...defaultStore, ticket: fromJS(ticket)})}
            >
                <TicketHeader {...minProps} ticket={fromJS(ticket)} />
            </Provider>
        )
        fireEvent.click(getByText(/more_vert/))
        fireEvent.click(getByText(/Print ticket/))

        expect(logEvent).toHaveBeenCalledWith(SegmentEvent.PrintTicketClicked)

        jest.runAllTimers()
    })

    it('should open the print page', () => {
        jest.useFakeTimers()

        const {getByText} = render(
            <Provider
                store={mockStore({...defaultStore, ticket: fromJS(ticket)})}
            >
                <TicketHeader {...minProps} ticket={fromJS(ticket)} />
            </Provider>
        )
        fireEvent.click(getByText(/more_vert/))
        fireEvent.click(getByText(/Print ticket/))

        jest.runAllTimers()
        expect(window.open).toHaveBeenCalledWith(
            `/app/ticket/${ticket.id}/print`
        )
    })

    it('should clear ticket and go to next ticket on ticket snooze', async () => {
        const {getByText} = render(
            <Provider store={mockStore(defaultStore)}>
                <TicketHeader {...minProps} ticket={fromJS(ticket)} />
            </Provider>
        )

        fireEvent.click(getByText(/Snooze/))

        expect(ticketActions.snoozeTicket).toHaveBeenCalled()
        await waitFor(() =>
            expect(ticketActions.clearTicket).toHaveBeenCalled()
        )
    })
})
