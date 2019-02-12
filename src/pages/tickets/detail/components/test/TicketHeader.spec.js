import React from 'react'
import {shallow} from 'enzyme'
import {fromJS} from 'immutable'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'

import TicketHeader from '../TicketHeader'

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)

// mock Date object
const DATE_TO_USE = new Date('2017')
global.Date = jest.fn(() => DATE_TO_USE)
global.Date.toISOString = Date.toISOString

describe('TicketHeader component', () => {
    const commonProps = {
        actions: {
            ticket: {
                setSubject: () => {}
            }
        }
    }

    const commonTicketProps = {
        subject: 'foo',
        status: 'open'
    }

    beforeEach(() => {
        commonProps.store = mockStore()
    })

    it('should render new ticket', () => {
        const component = shallow(
            <TicketHeader
                {...commonProps}
                ticket={fromJS(commonTicketProps)}
            />
        ).dive()

        expect(component).toMatchSnapshot()
    })

    it('should render existing ticket', () => {
        const component = shallow(
            <TicketHeader
                {...commonProps}
                ticket={fromJS({
                    id: 1,
                    ...commonTicketProps
                })}
            />
        ).dive()

        expect(component).toMatchSnapshot()
    })

    it('should render spam ticket', () => {
        const component = shallow(
            <TicketHeader
                {...commonProps}
                ticket={fromJS({
                    id: 1,
                    spam: true,
                    ...commonTicketProps
                })}
            />
        ).dive()

        expect(component).toMatchSnapshot()
    })

    it('should render trashed ticket', () => {
        const component = shallow(
            <TicketHeader
                {...commonProps}
                ticket={fromJS({
                    id: 1,
                    trashed_datetime: true,
                    ...commonTicketProps
                })}
            />
        ).dive()

        expect(component).toMatchSnapshot()
    })
})
