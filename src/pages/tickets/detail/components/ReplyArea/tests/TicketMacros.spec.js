import React from 'react'
import {fromJS} from 'immutable'
import {shallow} from 'enzyme'
import _noop from 'lodash/noop'

import {TicketMacrosContainer} from '../TicketMacros'

describe('TicketMacros component', () => {
    let defaultProps

    beforeEach(() => {
        defaultProps = {
            currentMacro: fromJS({}),
            newMessageType: 'email',
            fetchMacros: _noop,
            page: 1,
            totalPages: 1,
            deleteMacro: _noop,
            applyMacro: _noop,
            notify: _noop,
            onClearMacro: _noop,
            selectMacro: _noop,
        }
    })

    const baseMacros = [
        {
            id: 1,
            name: 'Refund my order',
            actions: [
                {
                    name: 'setResponseText',
                },
                {
                    name: 'addAttachments',
                },
            ],
        },
        {
            id: 2,
            name: 'Order my refund',
            actions: [],
        },
    ]

    it("should display an empty state if there's no macros", () => {
        const component = shallow(<TicketMacrosContainer {...defaultProps} />)

        expect(component.find('MacroNoResults')).toHaveLength(1)
    })

    it('should display macros list, and selected macro', () => {
        const macros = fromJS(baseMacros)
        const component = shallow(
            <TicketMacrosContainer
                {...defaultProps}
                macros={macros}
                currentMacro={macros.get(1)}
            />
        )

        expect(component).toMatchSnapshot()
    })
})
