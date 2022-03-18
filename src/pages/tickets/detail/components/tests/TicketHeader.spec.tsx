import React, {ComponentProps} from 'react'
import {render, fireEvent, waitFor} from '@testing-library/react'
import {fromJS} from 'immutable'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'
import _omit from 'lodash/omit'

import {ticket} from 'fixtures/ticket'
import * as notificationsActions from 'state/notifications/actions'
import * as ticketActions from 'state/ticket/actions'
import {RootState} from 'state/types'
import {UserRole} from '../../../../../config/types/user'
import {user} from '../../../../../fixtures/users'
import {NotificationStatus} from '../../../../../state/notifications/types'
import TicketHeader from '../TicketHeader'
import shortcutManager from '../../../../../services/shortcutManager'
import {makeExecuteKeyboardAction} from '../../../../../utils/testing'

jest.mock('../../../../../services/shortcutManager')

jest.mock('state/notifications/actions', () => ({
    notify: jest.fn(() => () => Promise.resolve()),
}))

jest.mock('state/ticket/actions', () => ({
    addTags: jest.fn(),
    clearTicket: jest.fn(),
    displayAuditLogEvents: jest.fn(),
    goToNextTicket: jest.fn(),
    hideAuditLogEvents: jest.fn(),
    removeTag: jest.fn(),
    setAgent: jest.fn(),
    setSpam: jest.fn(),
    setStatus: jest.fn(),
    setSubject: jest.fn(),
    setTeam: jest.fn(),
    setTrashed: jest.fn(),
    snoozeTicket: jest.fn(() => () => Promise.resolve()),
    ticketPartialUpdate: jest.fn(() => () => Promise.resolve()),
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

describe('<TicketHeader />', () => {
    const defaultStore: Partial<RootState> = {
        currentUser: fromJS(user),
        ticket: fromJS(_omit(ticket, 'id')),
    }

    const minProps = {
        className: '',
        ticket: fromJS(_omit(ticket, 'id')),
    } as ComponentProps<typeof TicketHeader>

    beforeEach(() => {
        jest.clearAllMocks()
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
        const {container} = render(
            <Provider
                store={mockStore({...defaultStore, ticket: fromJS(ticket)})}
            >
                <TicketHeader {...minProps} ticket={fromJS(ticket)} />
            </Provider>
        )

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
        const {getByText} = render(
            <Provider
                store={mockStore({
                    ...defaultStore,
                    ticket: readTicket,
                })}
            >
                <TicketHeader {...minProps} ticket={readTicket} />
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
            return expect(notificationsActions.notify).toHaveBeenNthCalledWith(
                1,
                {
                    message: 'Ticket has been marked as unread',
                    status: NotificationStatus.Success,
                }
            )
        })
    })

    it('should display the snooze icon when the snooze picker is opened', async () => {
        const {getByText, getAllByText} = render(
            <Provider store={mockStore(defaultStore)}>
                <TicketHeader {...minProps} ticket={fromJS(ticket)} />
            </Provider>
        )

        fireEvent.click(getByText(/more_vert/))
        fireEvent.click(getByText(/Snooze/))
        await waitFor(() => {
            expect(getAllByText(/snooze/).length).toBe(2)
        })
    })

    it('should change snooze label and display the clear snooze action when ticket is snoozed', () => {
        const snoozedTicket = fromJS({
            ...ticket,
            snooze_datetime: '2021-07-08T12:31:51.827563+00:00',
        })
        const {getByText} = render(
            <Provider
                store={mockStore({
                    ...defaultStore,
                    ticket: snoozedTicket,
                })}
            >
                <TicketHeader {...minProps} ticket={snoozedTicket} />
            </Provider>
        )

        fireEvent.click(getByText(/more_vert/))
        expect(getByText(/Clear snooze/)).toBeTruthy()
    })

    it('should un-snooze the ticket when clicking clear snooze action', () => {
        const snoozedTicket = fromJS({
            ...ticket,
            snooze_datetime: '2021-07-08T12:31:51.827563+00:00',
        })
        const {getByText} = render(
            <Provider
                store={mockStore({
                    ...defaultStore,
                    ticket: snoozedTicket,
                })}
            >
                <TicketHeader {...minProps} ticket={snoozedTicket} />
            </Provider>
        )

        fireEvent.click(getByText(/more_vert/))
        fireEvent.click(getByText(/Clear snooze/))
        expect(ticketActions.snoozeTicket).toHaveBeenNthCalledWith(1, null)
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
                        roles: [
                            {
                                name: UserRole.LiteAgent,
                            },
                        ],
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
                        roles: [
                            {
                                name: UserRole.LiteAgent,
                            },
                        ],
                    }),
                })}
            >
                <TicketHeader {...minProps} ticket={fromJS(ticket)} />
            </Provider>
        )

        makeExecuteKeyboardAction(
            shortcutManagerMock,
            shortcutEventMock
        )('DELETE_TICKET')

        expect(queryByText(/You are about to /)).toBeFalsy()
    })
})
