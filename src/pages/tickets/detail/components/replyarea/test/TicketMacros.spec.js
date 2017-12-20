import React from 'react'
import {fromJS} from 'immutable'
import {shallow} from 'enzyme'
import _noop from 'lodash/noop'

import TicketMacros from '../TicketMacros'

import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)

describe('TicketMacros component', () => {
    let store

    beforeEach(() => {
        store = mockStore({
            newMessage: fromJS({
                newMessage: {
                    source: {
                        type: 'email'
                    }
                }
            })
        })
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
            <TicketMacros
                store={store}
                macros={fromJS({items: [], visible: true})}
                applyMacro={_noop}
                openModal={_noop}
                setMacrosVisible={_noop}
                setSelectedMacroId={_noop}
            />
        ).dive()

        expect(component).toMatchSnapshot()
    })

    it('should display another empty state if there\'s no macros matching the searchQuery', () => {
        const component = shallow(
            <TicketMacros
                store={store}
                macros={fromJS({items: [], visible: true})}
                applyMacro={_noop}
                openModal={_noop}
                setMacrosVisible={_noop}
                setSelectedMacroId={_noop}
                searchQuery="Foo Bar"
            />
        ).dive()

        expect(component).toMatchSnapshot()
    })

    it('should display macros list, and selected macro', () => {
        const component = shallow(
            <TicketMacros
                store={store}
                macros={fromJS({items: baseMacros, visible: true})}
                applyMacro={_noop}
                openModal={_noop}
                setMacrosVisible={_noop}
                setSelectedMacroId={_noop}
                searchQuery="Foo Bar"
            />
        ).dive()

        expect(component).toMatchSnapshot()
    })
})
