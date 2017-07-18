import React from 'react'
import {mount} from 'enzyme'
import {fromJS} from 'immutable'
import _noop from 'lodash/noop'

import {MacroEdit} from '../MacroEdit'

describe('MacroEdit component', () => {
    let component
    const macro = fromJS({
        id: 1,
        name: 'Pizza Pepperoni'
    })
    const agents = fromJS({})
    const actions = fromJS([])
    const setName = jest.fn()

    beforeEach(() => {
        component = mount(
            <MacroEdit
                currentMacro={macro}
                agents={agents}
                actions={actions}
                setActions={_noop}
                hasIntegrationOfTypes={_noop}
                setName={setName}
            />
        )
    })

    it('should render the the macro edit form', () => {
        expect(component).toMatchSnapshot()
    })

    it('should change name input value', () => {
        const newName = 'Pizza Capricciosa'
        component.setProps({
            currentMacro: fromJS({
                id: 2,
                name: newName
            })
        })

        expect(component.find('#id-name').props().value).toBe(newName)
    })

    it('should not change name input value', () => {
        // id stays the same
        component.setProps({
            currentMacro: macro.set('name', 'Pizza Capricciosa')
        })

        expect(component.find('#id-name').props().value).toBe(macro.get('name'))
    })

    it('should update the macro name in the store', () => {
        const newName = 'Pizza Capricciosa'
        component.find('input').simulate('change', {target: {value: newName}})

        expect(setName).toBeCalledWith(newName)
    })
})
