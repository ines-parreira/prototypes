import React from 'react'
import {mount} from 'enzyme'
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
    const previewMacroInModal = jest.fn()
    const actions = {
        previewMacroInModal
    }

    beforeEach(() => {
        component = mount(
            <MacroList
                macros={macros}
                currentMacro={currentMacro}
                actions={actions}
                disableExternalActions={false}
            />
        )
    })

    it('should render the macro list', () => {
        expect(component).toMatchSnapshot()
    })

    it ('should activate the second macro', () => {
        const macroItem = component.find('.macro-item').at(1)
        macroItem.simulate('click')

        expect(previewMacroInModal).toBeCalledWith(2)
    })
})
