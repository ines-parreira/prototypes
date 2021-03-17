import React from 'react'
import {fromJS} from 'immutable'
import {shallow} from 'enzyme'
import _noop from 'lodash/noop'

import {TicketViewContainer} from '../TicketView'

describe('TicketView component', () => {
    const minProps = {
        actions: {
            macro: {},
            ticket: {},
        },
        applyMacro: _noop,
        computeNextUrl: _noop,
        hideTicket: _noop,
        isTicketHidden: false,
        submit: _noop,
        setStatus: _noop,
        currentUser: fromJS({}),
        customers: fromJS({}),
        ticket: fromJS({}),
        ticketBody: fromJS([]),
        customersIsLoading: jest.fn,
    }

    it('should not have the hidden classes', () => {
        expect(
            shallow(
                <TicketViewContainer {...minProps} isTicketHidden={false} />
            )
        ).not.toHaveClassName('transition')
    })

    it('should have the hidden classes', () => {
        expect(
            shallow(<TicketViewContainer {...minProps} isTicketHidden />)
        ).toHaveClassName('transition out fade right')
    })
})
