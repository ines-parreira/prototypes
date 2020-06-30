import React from 'react'
import {mount} from 'enzyme'
import {fromJS} from 'immutable'
import _noop from 'lodash/noop'

import {MacroEdit} from '../MacroEdit'

describe('MacroEdit component', () => {
    let component
    const defaultProps = {
        actions: fromJS([]),
        agents: fromJS({}),
        currentMacro: fromJS({id: 1}),
        hasIntegrationOfTypes: _noop,
        intents: {
            'catOne/intentOne': 'description one',
            'catOne/intentTwo': 'description two',
            'catTwo/intentTWo': 'description three',
        },
        name: 'Pizza Pepperoni',
        setActions: _noop,
        setIntent: _noop,
        setName: _noop,
    }

    beforeEach(() => {
        component = mount(<MacroEdit {...defaultProps} />)
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
