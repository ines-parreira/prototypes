import React from 'react'
import {shallow} from 'enzyme'
import {fromJS} from 'immutable'

import MacroList from '../MacroList'

describe('MacroList component', () => {
    let component
    const macros = fromJS([
        {
            id: 1,
            name: 'Pizza Pepperoni'
        },
        {
            id: 2,
            name: 'Pizza Capricciosa'
        }
    ])
    const currentMacro = macros.first()

    beforeEach(() => {
        component = shallow(
            <MacroList
                macros={macros}
                currentMacro={currentMacro}
                disableExternalActions={false}
            />
        )
    })

    it('should render the macro list', () => {
        expect(component).toMatchSnapshot()
    })
})
