import React from 'react'
import {shallow} from 'enzyme'
import {fromJS} from 'immutable'
import {DropdownItem, DropdownToggle} from 'reactstrap'

import {NOTIFICATION_STATUS} from '../../../../../state/notifications/constants.ts'
import {TicketHeaderContainer} from '../TicketHeader'

// mock Date object
const DATE_TO_USE = new Date('2017')
global.Date = jest.fn(() => DATE_TO_USE)
global.Date.toISOString = Date.toISOString

describe('<TicketHeader />', () => {
    const minProps = {
        addTags: jest.fn(),
        className: '',
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
        ticketPartialUpdate: jest.fn().mockResolvedValue(),
        timezone: 'America/Los_Angeles',
    }

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
                status: NOTIFICATION_STATUS.SUCCESS,
            })
            done()
        })
    })
})
