import React from 'react'
import {shallow} from 'enzyme'
import {fromJS} from 'immutable'

import MacroList from '../MacroList'

describe('MacroList component', () => {
    const macros = fromJS([
        {id: 1, name: 'Pizza Pepperoni'},
        {id: 2, name: 'Pizza Capricciosa'},
        {
            id: 3,
            name: 'Pizza Margherita',
            actions: [{name: 'http'}],
        },
    ])

    it('should render the macro list', () => {
        const component = shallow(
            <MacroList macros={macros} currentMacro={macros.first()} />
        )
        expect(component).toMatchSnapshot()
    })

    it('should render active and disabled macros', () => {
        const component = shallow(
            <MacroList
                macros={macros}
                currentMacro={macros.get(1)}
                disableExternalActions={true}
            />
        )
        expect(component).toMatchSnapshot()
    })
})
