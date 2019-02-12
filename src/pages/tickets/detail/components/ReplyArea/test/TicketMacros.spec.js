import React from 'react'
import {fromJS} from 'immutable'
import {shallow} from 'enzyme'
import _noop from 'lodash/noop'
import _assign from 'lodash/assign'


import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import TicketMacros from '../TicketMacros'

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)

describe('TicketMacros component', () => {
    let store
    let defaultProps
    const defaultState = {
        newMessage: fromJS({
            newMessage: {
                source: {
                    type: 'email'
                }
            }
        })
    }

    beforeEach(() => {
        store = mockStore(defaultState)
        defaultProps = {
            currentMacro: fromJS({}),
            newMessageType: 'email',
            fetchMacros: _noop,
            page: 1,
            totalPages: 1,
            deleteMacro: _noop,
            applyMacro: _noop,
            notify: _noop,
            hideMacros: _noop,
            selectMacro: _noop,
            store,
        }
    })

    const baseMacros = [{
        id: 1,
        name: 'Refund my order',
        actions: [{
            name: 'setResponseText'
        }, {
            name: 'addAttachments'
        }],
    }, {
        id: 2,
        name: 'Order my refund',
        actions: [],
    }]

    it('should display an empty state if there\'s no macros', () => {
        const component = shallow(
            <TicketMacros {...defaultProps} />
        )

        expect(component.dive().find('MacroNoResults')).toHaveLength(1)
    })

    it('should display macros list, and selected macro', () => {
        const macros = fromJS(baseMacros)
        const component = shallow(
            <TicketMacros
                {..._assign(defaultProps, {
                    currentMacro: macros.get(1),
                    macros,
                })}
            />
        )

        expect(component.dive()).toMatchSnapshot()
    })
})
