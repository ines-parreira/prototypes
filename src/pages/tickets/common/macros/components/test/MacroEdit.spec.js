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
        component = mount(
            <MacroEdit
                currentMacro={macro}
                agents={agents}
                actions={actions}
                setActions={_noop}
                hasIntegrationOfTypes={_noop}
                name="Pizza Pepperoni"
                setName={_noop}
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

        expect(component.find('#id-name').props().value).toBe(newName)
    })
})
