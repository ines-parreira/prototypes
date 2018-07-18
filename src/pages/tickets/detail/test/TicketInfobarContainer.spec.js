import React from 'react'
import {shallow} from 'enzyme'
import {fromJS} from 'immutable'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {browserHistory} from 'react-router'
import _noop from 'lodash/noop'
import * as immutableMatchers from 'jest-immutable-matchers'

import TicketInfobarContainer from '../TicketInfobarContainer'

jest.addMatchers(immutableMatchers)

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)

describe('TicketInfobarContainer component', () => {
    const minProps = {
        store: mockStore({
            infobar: fromJS({}),
            ticket: fromJS({}),
            widgets: fromJS({}),
        }),
        router: {
            ...browserHistory,
            setRouteLeaveHook: _noop,
            isActive: _noop,

            params: {
                ticketId: 'new'
            },
            location: {
                query: {}
            },
        },
        route: {},
    }

    it('should render infobar for new ticket', () => {
        const component = shallow(<TicketInfobarContainer {...minProps} />).dive().dive()
        expect(component).toMatchSnapshot()
    })

    it('should disable widget editing new tickets without customer', () => {
        const component = shallow(<TicketInfobarContainer {...minProps} />).dive().dive()

        expect(component.prop('customer')).toBeImmutable(fromJS({}))
    })

    it('should allow widget editing new tickets with customer', () => {
        const ticket = fromJS({
            customer: {name: 'Pizza Pepperoni'}
        })
        const component = shallow(<TicketInfobarContainer {...minProps} />).dive().dive()
        component.setProps({ticket})

        expect(component.prop('customer')).toBeImmutable(ticket.get('customer'))
    })
})
