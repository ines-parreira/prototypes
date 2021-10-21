import React, {ComponentProps} from 'react'
import {shallow} from 'enzyme'
import {fromJS} from 'immutable'
import {DropdownItem, DropdownToggle, DropdownMenu, Popover} from 'reactstrap'

import {UserRole} from '../../../../../config/types/user'
import {user} from '../../../../../fixtures/users'
import {NotificationStatus} from '../../../../../state/notifications/types'
import {TicketHeaderContainer} from '../TicketHeader'
import shortcutManager from '../../../../../services/shortcutManager'
import {makeExecuteKeyboardAction} from '../../../../../utils/testing'

jest.mock('../../../../../services/shortcutManager')

const shortcutManagerMock = shortcutManager as jest.Mocked<
    typeof shortcutManager
>
const shortcutEventMock = ({
    preventDefault: jest.fn(),
} as unknown) as jest.Mocked<Event>

// mock Date object
const DATE_TO_USE = new Date('2017')
jest.spyOn(Date, 'now').mockImplementation(() => DATE_TO_USE.getTime())

describe('<TicketHeader />', () => {
    const minProps = ({
        addTags: jest.fn(),
        className: '',
        currentUser: fromJS(user),
        clearTicket: jest.fn(),
        displayAuditLogEvents: jest.fn(),
        goToNextTicket: jest.fn(),
        hideAuditLogEvents: jest.fn(),
        notify: jest.fn(),
        removeTag: jest.fn(),
        setAgent: jest.fn(),
        setSpam: jest.fn(),
        setStatus: jest.fn(),
        setSubject: jest.fn(),
        setTeam: jest.fn(),
        setTrashed: jest.fn(),
        snoozeTicket: jest.fn(),
        ticketPartialUpdate: jest.fn().mockResolvedValue(undefined),
        timezone: 'America/Los_Angeles',
    } as unknown) as ComponentProps<typeof TicketHeaderContainer>

    const commonTicketProps = {
        subject: 'foo',
        status: 'open',
    }

    it('should render new ticket', () => {
        const component = shallow(
            <TicketHeaderContainer
                {...minProps}
                ticket={fromJS(commonTicketProps)}
            />
        )
        expect(component).toMatchSnapshot()
    })

    it('should render existing ticket', () => {
        const component = shallow(
            <TicketHeaderContainer
                {...minProps}
                ticket={fromJS({
                    id: 1,
                    ...commonTicketProps,
                })}
            />
        )

        expect(component).toMatchSnapshot()
    })

    it('should render spam ticket', () => {
        const component = shallow(
            <TicketHeaderContainer
                {...minProps}
                ticket={fromJS({
                    id: 1,
                    spam: true,
                    ...commonTicketProps,
                })}
            />
        )

        expect(component).toMatchSnapshot()
    })

    it('should render trashed ticket', () => {
        const component = shallow(
            <TicketHeaderContainer
                {...minProps}
                ticket={fromJS({
                    id: 1,
                    trashed_datetime: true,
                    ...commonTicketProps,
                })}
            />
        )

        expect(component).toMatchSnapshot()
    })

    it('should render an unread ticket without the "Mark as unread" action', () => {
        const component = shallow(
            <TicketHeaderContainer
                {...minProps}
                ticket={fromJS({
                    id: 1,
                    is_unread: true,
                    ...commonTicketProps,
                })}
            />
        )

        expect(component).toMatchSnapshot()
    })

    it('should mark a ticket as unread when clicking "Mark as unread" button', (done) => {
        const component = shallow(
            <TicketHeaderContainer
                {...minProps}
                ticket={fromJS({
                    id: 1,
                    ...commonTicketProps,
                })}
            />
        )
        component.find(DropdownToggle).simulate('click')
        component.find(DropdownItem).at(2).simulate('click')
        setImmediate(() => {
            expect(minProps.ticketPartialUpdate).toHaveBeenNthCalledWith(1, {
                is_unread: true,
            })
            expect(minProps.notify).toHaveBeenNthCalledWith(1, {
                message: 'Ticket has been marked as unread',
                status: NotificationStatus.Success,
            })
            done()
        })
    })

    it('should display the snooze icon when the snooze picker is opened', () => {
        const component = shallow(
            <TicketHeaderContainer
                {...minProps}
                ticket={fromJS({
                    id: 1,
                    ...commonTicketProps,
                })}
            />
        )
        component.find(DropdownToggle).simulate('click')
        component.find(DropdownItem).at(0).simulate('click')

        expect(component.find(DropdownToggle)).toMatchSnapshot()
    })

    it('should change snooze label and display the clear snooze action when ticket is snoozed', () => {
        const component = shallow(
            <TicketHeaderContainer
                {...minProps}
                ticket={fromJS({
                    id: 1,
                    ...commonTicketProps,
                    snooze_datetime: '2021-07-08T12:31:51.827563+00:00',
                })}
            />
        )

        component.find(DropdownToggle).simulate('click')
        expect(component.find(DropdownMenu)).toMatchSnapshot()
    })

    it('should un-snooze the ticket when clicking clear snooze action', () => {
        const component = shallow(
            <TicketHeaderContainer
                {...minProps}
                ticket={fromJS({
                    id: 1,
                    ...commonTicketProps,
                    snooze_datetime: '2021-07-08T12:31:51.827563+00:00',
                })}
            />
        )

        component.find(DropdownToggle).simulate('click')
        component.find(DropdownItem).at(1).simulate('click')
        expect(minProps.snoozeTicket).toHaveBeenNthCalledWith(1, null)
    })

    it('should display the delete action for lead and admin agents', () => {
        const component = shallow(
            <TicketHeaderContainer
                {...minProps}
                ticket={fromJS({
                    id: 1,
                    ...commonTicketProps,
                })}
            />
        )

        expect(component.find(DropdownItem).at(6)).toMatchSnapshot()
    })

    it('should not display the delete action for basic, lite and observer agents', () => {
        const component = shallow(
            <TicketHeaderContainer
                {...minProps}
                ticket={fromJS({
                    id: 1,
                    ...commonTicketProps,
                })}
                currentUser={fromJS({
                    ...user,
                    roles: [
                        {
                            name: UserRole.LiteAgent,
                        },
                    ],
                })}
            />
        )

        expect(component.find(DropdownItem).at(6).exists()).toBe(false)
    })

    it('should not register the delete action shortcut for basic, lite and observer agents', () => {
        const component = shallow(
            <TicketHeaderContainer
                {...minProps}
                ticket={fromJS({
                    id: 1,
                    ...commonTicketProps,
                })}
                currentUser={fromJS({
                    ...user,
                    roles: [
                        {
                            name: UserRole.LiteAgent,
                        },
                    ],
                })}
            />
        )

        makeExecuteKeyboardAction(
            shortcutManagerMock,
            shortcutEventMock
        )('DELETE_TICKET')

        expect(component.find(Popover).exists()).toBe(false)
    })
})
