import React from 'react'
import {shallow} from 'enzyme'
import {fromJS} from 'immutable'

import {TicketHeaderContainer} from '../TicketHeader'

// mock Date object
const DATE_TO_USE = new Date('2017')
global.Date = jest.fn(() => DATE_TO_USE)
global.Date.toISOString = Date.toISOString

describe('TicketHeader component', () => {
    const commonProps = {
        actions: {
            ticket: {
                setSubject: () => {},
            },
        },
        timezone: 'America/Los_Angeles',
    }

    const commonTicketProps = {
        subject: 'foo',
        status: 'open',
    }

    it('should render new ticket', () => {
        const component = shallow(
            <TicketHeaderContainer
                {...commonProps}
                ticket={fromJS(commonTicketProps)}
            />
        )
        expect(component).toMatchSnapshot()
    })

    it('should render existing ticket', () => {
        const component = shallow(
            <TicketHeaderContainer
                {...commonProps}
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
                {...commonProps}
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
                {...commonProps}
                ticket={fromJS({
                    id: 1,
                    trashed_datetime: true,
                    ...commonTicketProps,
                })}
            />
        )

        expect(component).toMatchSnapshot()
    })
})
