import React from 'react'
import {mount} from 'enzyme'
import {fromJS} from 'immutable'
import _noop from 'lodash/noop'

import {MacroEdit} from '../MacroEdit'

describe('MacroEdit component', () => {
    let component
    const macro = fromJS({
        id: 1,
    })
    const agents = fromJS({})
    const actions = fromJS([])

    beforeEach(() => {
        window.GORGIAS_CONSTANTS = {'MACRO_INTENTS': {
            'catOne/intentOne': 'description one',
            'catOne/intentTwo': 'description two',
            'catTwo/intentTWo': 'description three'
        }}
        component = mount(
            <MacroEdit
                currentMacro={macro}
                agents={agents}
                actions={actions}
                setActions={_noop}
                hasIntegrationOfTypes={_noop}
                name="Pizza Pepperoni"
                setName={_noop}
                setIntent={_noop}
            />
        )
    })

    it('should render the macro edit form', () => {
        expect(component).toMatchSnapshot()
    })

    it('should change name input value', () => {
        const newName = 'Pizza Capricciosa'
        component.setProps({
            name: newName,
        })

        expect(component.find('input#id-name').props().value).toBe(newName)
    })
})
