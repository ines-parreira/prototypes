import React from 'react'
import {shallow} from 'enzyme'
import _noop from 'lodash/noop'

import configureStore from '../../../../../store/configureStore'

import TicketView from '../TicketView'

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
        store: configureStore(),
    }

    it('should not have the hidden classes', () => {
        expect(
            shallow(
                <TicketView
                    {...minProps}
                    isTicketHidden={false}
                />
            ).dive()
        ).not.toHaveClassName('transition')
    })

    it('should have the hidden classes', () => {
        expect(
            shallow(
                <TicketView
                    {...minProps}
                    isTicketHidden
                />
            ).dive()
        ).toHaveClassName('transition out fade right')
    })
})
